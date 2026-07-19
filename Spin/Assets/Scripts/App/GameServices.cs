using Spin.Level;
using Spin.Localization;
using Spin.Persistence;
using Spin.Tutorial;

namespace Spin.App
{
    /// <summary>Composition-root-populated service locator. Set once by GameBootstrap at startup.</summary>
    public static class GameServices
    {
        public static LocalizationManager Localization { get; internal set; }
        public static SaveManager Save { get; internal set; }
        public static LevelCatalog Levels { get; internal set; }
        public static TutorialManager Tutorial { get; internal set; }
    }
}
