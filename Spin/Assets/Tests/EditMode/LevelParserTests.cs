using NUnit.Framework;
using Spin.Level;
using Spin.Model;

namespace Spin.Tests.EditMode
{
    public class LevelParserTests
    {
        private const string ValidLevelJson = @"{
            ""id"": 3,
            ""group"": 1,
            ""nameKey"": ""level.3.name"",
            ""grid"": [
                ""#######"",
                ""#S....#"",
                ""#.###.#"",
                ""#.....#"",
                ""#.###.#"",
                ""#....E#"",
                ""#######""
            ],
            ""diamond"": ""C4"",
            ""enemies"": [
                { ""order"": 1, ""type"": ""badger"", ""start"": ""D4"", ""axis"": ""horizontal"", ""initialDir"": ""left"" }
            ]
        }";

        [Test]
        public void Parse_ValidLevelJson_ProducesExpectedLevelData()
        {
            var level = LevelParser.Parse(ValidLevelJson);

            Assert.AreEqual(3, level.Id);
            Assert.AreEqual(1, level.Group);
            Assert.AreEqual("level.3.name", level.NameKey);
            Assert.AreEqual(Coord.ParseLabel("B2"), level.Spawn);
            Assert.AreEqual(Coord.ParseLabel("F6"), level.Exit);
            Assert.AreEqual(Coord.ParseLabel("C4"), level.Diamond);
            Assert.AreEqual(1, level.Enemies.Count);
            Assert.AreEqual(EnemyType.Badger, level.Enemies[0].Type);
            Assert.AreEqual(Coord.ParseLabel("D4"), level.Enemies[0].Start);
            Assert.AreEqual(Axis.Horizontal, level.Enemies[0].Axis);
            Assert.AreEqual(Direction.Left, level.Enemies[0].InitialDirection);
        }

        [Test]
        public void Parse_GridNotSevenBySeven_Throws()
        {
            const string json = @"{
                ""id"": 1, ""group"": 1, ""nameKey"": ""level.1.name"",
                ""grid"": [
                    ""#######"", ""#S....#"", ""#.....#"", ""#.....#"", ""#....E#"", ""#######""
                ],
                ""diamond"": ""D4"",
                ""enemies"": []
            }";

            Assert.Throws<LevelValidationException>(() => LevelParser.Parse(json));
        }

        [Test]
        public void Parse_MissingSpawn_Throws()
        {
            const string json = @"{
                ""id"": 1, ""group"": 1, ""nameKey"": ""level.1.name"",
                ""grid"": [
                    ""#######"", ""#.....#"", ""#.....#"", ""#.....#"", ""#.....#"", ""#....E#"", ""#######""
                ],
                ""diamond"": ""D4"",
                ""enemies"": []
            }";

            Assert.Throws<LevelValidationException>(() => LevelParser.Parse(json));
        }

        [Test]
        public void Parse_DuplicateExit_Throws()
        {
            const string json = @"{
                ""id"": 1, ""group"": 1, ""nameKey"": ""level.1.name"",
                ""grid"": [
                    ""#######"", ""#S...E#"", ""#.....#"", ""#.....#"", ""#.....#"", ""#....E#"", ""#######""
                ],
                ""diamond"": ""D4"",
                ""enemies"": []
            }";

            Assert.Throws<LevelValidationException>(() => LevelParser.Parse(json));
        }

        [Test]
        public void Parse_GemOnSpawnCell_Throws()
        {
            const string json = @"{
                ""id"": 1, ""group"": 1, ""nameKey"": ""level.1.name"",
                ""grid"": [
                    ""#######"", ""#S....#"", ""#.....#"", ""#.....#"", ""#.....#"", ""#....E#"", ""#######""
                ],
                ""diamond"": ""B2"",
                ""enemies"": []
            }";

            Assert.Throws<LevelValidationException>(() => LevelParser.Parse(json));
        }

        [Test]
        public void Parse_GemOnExitCell_Throws()
        {
            const string json = @"{
                ""id"": 1, ""group"": 1, ""nameKey"": ""level.1.name"",
                ""grid"": [
                    ""#######"", ""#S....#"", ""#.....#"", ""#.....#"", ""#.....#"", ""#....E#"", ""#######""
                ],
                ""diamond"": ""F6"",
                ""enemies"": []
            }";

            Assert.Throws<LevelValidationException>(() => LevelParser.Parse(json));
        }

        [Test]
        public void Parse_EnemyStartOnNonFloorCell_Throws()
        {
            const string json = @"{
                ""id"": 1, ""group"": 1, ""nameKey"": ""level.1.name"",
                ""grid"": [
                    ""#######"", ""#S....#"", ""#.....#"", ""#.....#"", ""#.....#"", ""#....E#"", ""#######""
                ],
                ""diamond"": ""D4"",
                ""enemies"": [
                    { ""order"": 1, ""type"": ""badger"", ""start"": ""A1"", ""axis"": ""horizontal"", ""initialDir"": ""left"" }
                ]
            }";

            Assert.Throws<LevelValidationException>(() => LevelParser.Parse(json));
        }

        [Test]
        public void Parse_DuplicateEnemyOrder_Throws()
        {
            const string json = @"{
                ""id"": 1, ""group"": 1, ""nameKey"": ""level.1.name"",
                ""grid"": [
                    ""#######"", ""#S....#"", ""#.....#"", ""#.....#"", ""#.....#"", ""#....E#"", ""#######""
                ],
                ""diamond"": ""D4"",
                ""enemies"": [
                    { ""order"": 1, ""type"": ""badger"", ""start"": ""C2"", ""axis"": ""horizontal"", ""initialDir"": ""left"" },
                    { ""order"": 1, ""type"": ""badger"", ""start"": ""E2"", ""axis"": ""horizontal"", ""initialDir"": ""right"" }
                ]
            }";

            Assert.Throws<LevelValidationException>(() => LevelParser.Parse(json));
        }

        [Test]
        public void Parse_AxisInitialDirIncoherent_Throws()
        {
            const string json = @"{
                ""id"": 1, ""group"": 1, ""nameKey"": ""level.1.name"",
                ""grid"": [
                    ""#######"", ""#S....#"", ""#.....#"", ""#.....#"", ""#.....#"", ""#....E#"", ""#######""
                ],
                ""diamond"": ""D4"",
                ""enemies"": [
                    { ""order"": 1, ""type"": ""badger"", ""start"": ""C2"", ""axis"": ""horizontal"", ""initialDir"": ""up"" }
                ]
            }";

            Assert.Throws<LevelValidationException>(() => LevelParser.Parse(json));
        }

        [Test]
        public void Parse_UnsupportedEnemyType_Throws()
        {
            const string json = @"{
                ""id"": 1, ""group"": 1, ""nameKey"": ""level.1.name"",
                ""grid"": [
                    ""#######"", ""#S....#"", ""#.....#"", ""#.....#"", ""#.....#"", ""#....E#"", ""#######""
                ],
                ""diamond"": ""D4"",
                ""enemies"": [
                    { ""order"": 1, ""type"": ""fox"", ""start"": ""C2"", ""axis"": ""horizontal"", ""initialDir"": ""left"" }
                ]
            }";

            Assert.Throws<LevelValidationException>(() => LevelParser.Parse(json));
        }
    }
}
