using NUnit.Framework;
using Spin.Localization;

namespace Spin.Tests.EditMode
{
    public class LocalizationParserTests
    {
        [Test]
        public void Parse_FlatKeyValueJson_ProducesDictionary()
        {
            const string json = @"{ ""app.name"": ""Spín"", ""ui.play"": ""Jugar"" }";

            var table = LocalizationParser.Parse(json);

            Assert.AreEqual(2, table.Count);
            Assert.AreEqual("Spín", table["app.name"]);
            Assert.AreEqual("Jugar", table["ui.play"]);
        }

        [Test]
        public void Parse_EmptyObject_ProducesEmptyDictionary()
        {
            var table = LocalizationParser.Parse("{}");

            Assert.AreEqual(0, table.Count);
        }

        [Test]
        public void Parse_EscapedQuoteAndNewline_AreUnescaped()
        {
            const string json = @"{ ""msg.test"": ""Line one\nHe said \""hi\"""" }";

            var table = LocalizationParser.Parse(json);

            Assert.AreEqual("Line one\nHe said \"hi\"", table["msg.test"]);
        }

        [Test]
        public void Parse_MalformedJson_Throws()
        {
            const string json = @"{ ""ui.play"" ""Jugar"" }"; // missing colon

            Assert.Throws<System.FormatException>(() => LocalizationParser.Parse(json));
        }

        [Test]
        public void GetText_MissingKeyInNonEnglish_FallsBackToEnglish()
        {
            var manager = new LocalizationManager();
            manager.RegisterLanguage(Language.En, @"{ ""ui.play"": ""Play"", ""ui.retry"": ""Retry"" }");
            manager.RegisterLanguage(Language.Ca, @"{ ""ui.play"": ""Jugar"" }"); // ui.retry missing on purpose
            manager.LoadLanguage(Language.Ca);

            Assert.AreEqual("Jugar", manager.GetText("ui.play"));
            Assert.AreEqual("Retry", manager.GetText("ui.retry"), "Missing key must fall back to English, not blank.");
        }

        [Test]
        public void GetText_UnknownKeyEverywhere_ReturnsKeyItselfRatherThanThrowOrBlank()
        {
            var manager = new LocalizationManager();
            manager.RegisterLanguage(Language.En, @"{ ""ui.play"": ""Play"" }");
            manager.LoadLanguage(Language.En);

            Assert.AreEqual("ui.nonexistent", manager.GetText("ui.nonexistent"));
        }
    }
}
