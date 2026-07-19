using System;
using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.Networking;

namespace Spin.Localization
{
    /// <summary>Loads a language's JSON from StreamingAssets/Localization via UnityWebRequest.</summary>
    public sealed class LocalizationFileLoader
    {
        public IEnumerator LoadLanguageText(Language language, Action<string> onLoaded, Action<string> onError)
        {
            string fileName = LocalizationManager.LanguageCode(language) + ".json";
            string url = BuildUrl(Path.Combine("Localization", fileName));

            using (var request = UnityWebRequest.Get(url))
            {
                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    onError?.Invoke($"Failed to load '{fileName}': {request.error}");
                    yield break;
                }

                onLoaded?.Invoke(request.downloadHandler.text);
            }
        }

        private static string BuildUrl(string relativePath)
        {
            string fullPath = Path.Combine(Application.streamingAssetsPath, relativePath);
#if UNITY_ANDROID && !UNITY_EDITOR
            return fullPath; // streamingAssetsPath is already a jar:file:// URI on Android.
#else
            return "file://" + fullPath;
#endif
        }
    }
}
