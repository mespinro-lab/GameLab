using System;
using System.Collections.Generic;
using UnityEngine;
using Spin.Model;

namespace Spin.Level
{
    /// <summary>
    /// Deserializes and validates level JSON (§10). All checks fail fast with a specific message
    /// naming the level id and the exact rule violated, per the coding standard for load-time validation.
    /// </summary>
    public static class LevelParser
    {
        private const int GridSize = GridModel.Size;
        private static readonly HashSet<char> ValidGridChars = new HashSet<char> { '#', '%', '.', 'S', 'E', '*' };

        public static LevelData Parse(string rawJson)
        {
            LevelDataDto dto;
            try
            {
                dto = JsonUtility.FromJson<LevelDataDto>(rawJson);
            }
            catch (Exception ex)
            {
                throw new LevelValidationException($"Malformed level JSON: {ex.Message}");
            }

            if (dto == null)
                throw new LevelValidationException("Level JSON parsed to null.");

            return Validate(dto);
        }

        public static LevelData Validate(LevelDataDto dto)
        {
            if (dto.id <= 0)
                throw new LevelValidationException($"Level id must be positive, got {dto.id}.");
            if (dto.group <= 0)
                throw new LevelValidationException($"Level {dto.id}: group must be positive, got {dto.group}.");
            if (string.IsNullOrEmpty(dto.nameKey))
                throw new LevelValidationException($"Level {dto.id}: nameKey is required.");

            if (dto.grid == null || dto.grid.Length != GridSize)
                throw new LevelValidationException(
                    $"Level {dto.id}: grid must have exactly {GridSize} rows, got {dto.grid?.Length ?? 0}.");

            for (int row = 0; row < GridSize; row++)
            {
                string line = dto.grid[row];
                if (line == null || line.Length != GridSize)
                    throw new LevelValidationException(
                        $"Level {dto.id}: grid row {row + 1} must have exactly {GridSize} characters, got '{line}'.");

                foreach (char c in line)
                    if (!ValidGridChars.Contains(c))
                        throw new LevelValidationException(
                            $"Level {dto.id}: grid row {row + 1} contains unknown character '{c}'.");
            }

            Coord? spawn = null;
            Coord? exit = null;
            int spawnCount = 0;
            int exitCount = 0;

            for (int row = 0; row < GridSize; row++)
            {
                for (int col = 0; col < GridSize; col++)
                {
                    char c = dto.grid[row][col];
                    if (c == 'S') { spawn = new Coord(col, row); spawnCount++; }
                    if (c == 'E') { exit = new Coord(col, row); exitCount++; }
                }
            }

            if (spawnCount != 1)
                throw new LevelValidationException($"Level {dto.id}: grid must contain exactly one 'S' spawn, found {spawnCount}.");
            if (exitCount != 1)
                throw new LevelValidationException($"Level {dto.id}: grid must contain exactly one 'E' exit, found {exitCount}.");

            if (!Coord.TryParseLabel(dto.diamond, out var diamond))
                throw new LevelValidationException($"Level {dto.id}: diamond coordinate '{dto.diamond}' is invalid.");

            char diamondChar = dto.grid[diamond.Row][diamond.Col];
            if (diamondChar != '.')
                throw new LevelValidationException(
                    $"Level {dto.id}: diamond at {diamond.Label} must sit on an open gallery cell ('.'), found '{diamondChar}'.");
            if (diamond == spawn.Value)
                throw new LevelValidationException($"Level {dto.id}: diamond cannot be on the spawn cell (R13).");
            if (diamond == exit.Value)
                throw new LevelValidationException($"Level {dto.id}: diamond cannot be on the exit cell (R13).");

            var enemies = new List<LevelEnemyData>();
            var seenOrders = new HashSet<int>();
            var seenStarts = new HashSet<Coord>();

            if (dto.enemies != null)
            {
                foreach (var e in dto.enemies)
                {
                    if (!seenOrders.Add(e.order))
                        throw new LevelValidationException($"Level {dto.id}: duplicate enemy order {e.order}.");

                    if (!Enum.TryParse(e.type, true, out EnemyType type))
                        throw new LevelValidationException(
                            $"Level {dto.id}: enemy type '{e.type}' is not supported in this prototype (only 'badger').");

                    if (!Coord.TryParseLabel(e.start, out var start))
                        throw new LevelValidationException($"Level {dto.id}: enemy start coordinate '{e.start}' is invalid.");

                    char startChar = dto.grid[start.Row][start.Col];
                    if (startChar != '.')
                        throw new LevelValidationException(
                            $"Level {dto.id}: enemy at {start.Label} must start on an open gallery cell ('.'), found '{startChar}'.");

                    if (!seenStarts.Add(start))
                        throw new LevelValidationException($"Level {dto.id}: two enemies cannot share start cell {start.Label}.");

                    // Note: an enemy MAY start on the diamond cell (e.g. Level 4: the gem sits
                    // where the badger currently stands, reachable once it patrols away) — not a conflict.

                    if (!Enum.TryParse(e.axis, true, out Axis axis))
                        throw new LevelValidationException($"Level {dto.id}: enemy axis '{e.axis}' must be 'horizontal' or 'vertical'.");

                    if (!Enum.TryParse(e.initialDir, true, out Direction initialDir))
                        throw new LevelValidationException($"Level {dto.id}: enemy initialDir '{e.initialDir}' is invalid.");

                    if (initialDir.ToAxis() != axis)
                        throw new LevelValidationException(
                            $"Level {dto.id}: enemy initialDir '{e.initialDir}' is not coherent with axis '{e.axis}'.");

                    enemies.Add(new LevelEnemyData(e.order, type, start, axis, initialDir));
                }
            }

            return new LevelData(dto.id, dto.group, dto.nameKey, dto.grid, spawn.Value, exit.Value, diamond, enemies);
        }
    }
}
