namespace Spin.Tutorial
{
    /// <summary>One contextual tip (§9.5): its i18n key and the semantic anchor the View resolves to a UI element.</summary>
    public sealed class TutorialDefinition
    {
        public string Key { get; }
        public string AnchorId { get; }

        public TutorialDefinition(string key, string anchorId)
        {
            Key = key;
            AnchorId = anchorId;
        }
    }
}
