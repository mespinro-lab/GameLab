using System;
using System.Collections.Generic;

namespace Spin.Model
{
    /// <summary>
    /// The single state machine implementing the strict turn sequence of §5. No turn logic
    /// lives anywhere else. ExecuteTurn is the only entry point:
    ///   1. INPUT      -> IsActionLegal gate (illegal actions never mutate state)
    ///   2. SPÍN ACTS  -> apply R1-R4, then resolve R5/R6 auto-pickups
    ///   3. CHECK      -> defeat (R11b) before victory (R12); either stops the turn here
    ///   4-5. ENEMIES  -> move in fixed `order` (R17), stopping immediately on capture (R11a)
    ///   6. NEW TURN   -> caller calls ExecuteTurn again
    /// </summary>
    public sealed class TurnManager
    {
        private readonly GridModel _grid;
        private readonly GameState _state = new GameState();

        public event Action<TurnResult> TurnResolved;
        public event Action<PlayerAction> ActionRejected;

        public GameState CurrentState => _state;

        public TurnManager(GridModel grid, int initialSpikeInventory = 0)
        {
            _grid = grid;
            _state.SpikeInventory = initialSpikeInventory;
        }

        public bool IsActionLegal(PlayerAction action)
        {
            if (_state.Status != GameStatus.Playing) return false;

            switch (action.Kind)
            {
                case ActionKind.Move:
                    return _grid.CanSpinEnter(_grid.SpinPosition.Offset(action.Direction));
                case ActionKind.BreakWall:
                    return IsOrthogonallyAdjacent(_grid.SpinPosition, action.Target) && _grid.CanBreakWallAt(action.Target);
                case ActionKind.PlaceSpike:
                    return _state.SpikeInventory > 0
                        && IsOrthogonallyAdjacent(_grid.SpinPosition, action.Target)
                        && _grid.CanPlaceSpikeAt(action.Target);
                case ActionKind.Wait:
                    return true;
                default:
                    return false;
            }
        }

        /// <summary>Runs a full turn. Returns null (and fires ActionRejected instead) if the action is illegal.</summary>
        public TurnResult ExecuteTurn(PlayerAction action)
        {
            if (!IsActionLegal(action))
            {
                ActionRejected?.Invoke(action);
                return null;
            }

            bool wallBroken = false;
            bool spikePlaced = false;
            bool spinMoved = false;

            switch (action.Kind)
            {
                case ActionKind.Move:
                    _grid.MoveSpin(_grid.SpinPosition.Offset(action.Direction));
                    spinMoved = true;
                    break;
                case ActionKind.BreakWall:
                    _grid.BreakWall(action.Target);
                    wallBroken = true;
                    break;
                case ActionKind.PlaceSpike:
                    _grid.PlaceSpike(action.Target);
                    _state.SpikeInventory -= 1;
                    spikePlaced = true;
                    break;
                case ActionKind.Wait:
                    break;
            }

            _state.TurnCount += 1;

            bool gemCollected = _grid.TryCollectGem(_grid.SpinPosition);
            if (gemCollected) _state.HasGem = true;

            bool wildSpikeCollected = _grid.CollectWildSpike(_grid.SpinPosition);
            if (wildSpikeCollected) _state.SpikeInventory += 1;

            // Only a Move can newly trigger this — door-wobble feedback fires on arrival, not on
            // every idle turn spent already standing at the exit (see plan decisions log, #3).
            bool exitAttemptedWithoutGem = spinMoved && _grid.SpinPosition == _grid.ExitCoord && !_state.HasGem;

            // R11b before R12 (defeat checked before victory).
            if (_grid.HasEnemyAt(_grid.SpinPosition))
            {
                _state.Status = GameStatus.Defeat;
                _state.DefeatCause = DefeatCause.SpinEnteredEnemyCell;
                return Finish(gemCollected, wildSpikeCollected, wallBroken, spikePlaced, exitAttemptedWithoutGem, EmptyOutcomes);
            }

            if (_state.HasGem && _grid.SpinPosition == _grid.ExitCoord)
            {
                _state.Status = GameStatus.Victory;
                return Finish(gemCollected, wildSpikeCollected, wallBroken, spikePlaced, exitAttemptedWithoutGem, EmptyOutcomes);
            }

            var outcomes = RunEnemyPhase();
            return Finish(gemCollected, wildSpikeCollected, wallBroken, spikePlaced, exitAttemptedWithoutGem, outcomes);
        }

        private static readonly IReadOnlyList<EnemyMoveOutcome> EmptyOutcomes = new List<EnemyMoveOutcome>();

        private List<EnemyMoveOutcome> RunEnemyPhase()
        {
            var outcomes = new List<EnemyMoveOutcome>();

            foreach (var enemy in _grid.Enemies)
            {
                var from = enemy.Position;
                var moveResult = enemy.Strategy.ComputeMove(enemy, _grid);
                bool captured = moveResult.Moved && moveResult.Destination == _grid.SpinPosition;

                _grid.MoveEnemy(enemy, moveResult.Destination);
                enemy.CurrentDirection = moveResult.NewDirection;

                outcomes.Add(new EnemyMoveOutcome(enemy, from, moveResult.Destination, moveResult.Moved, moveResult.Bounced, captured));

                if (captured)
                {
                    _state.Status = GameStatus.Defeat;
                    _state.DefeatCause = DefeatCause.EnemyEnteredSpinCell;
                    break; // R11a/R17: remaining enemies do not move this turn.
                }
            }

            return outcomes;
        }

        private TurnResult Finish(
            bool gemCollected,
            bool wildSpikeCollected,
            bool wallBroken,
            bool spikePlaced,
            bool exitAttemptedWithoutGem,
            IReadOnlyList<EnemyMoveOutcome> outcomes)
        {
            var result = new TurnResult(
                _state.Status,
                _state.DefeatCause,
                _state.TurnCount,
                gemCollected,
                wildSpikeCollected,
                wallBroken,
                spikePlaced,
                exitAttemptedWithoutGem,
                outcomes);

            TurnResolved?.Invoke(result);
            return result;
        }

        private static bool IsOrthogonallyAdjacent(Coord a, Coord b)
        {
            int dc = Math.Abs(a.Col - b.Col);
            int dr = Math.Abs(a.Row - b.Row);
            return (dc == 1 && dr == 0) || (dc == 0 && dr == 1);
        }
    }
}
