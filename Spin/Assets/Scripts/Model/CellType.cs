namespace Spin.Model
{
    /// <summary>Runtime cell state (§4). Spawn ('S') collapses to Floor once the grid is built.</summary>
    public enum CellType
    {
        Fixed,
        ThinWall,
        Floor,
        Exit,
        PlacedSpike,
        WildSpike
    }
}
