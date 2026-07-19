namespace Spin.Tutorial
{
    /// <summary>
    /// Event-based tips from §9.5 that are not tied to "level start". Level-start tips are
    /// requested via TutorialManager.NotifyLevelStarted(levelId) instead.
    /// </summary>
    public enum TutorialTrigger
    {
        GemCollected,
        ExitEnteredWithoutGem,
        WildSpikeCollected
    }
}
