using System;
using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.Networking;

namespace Spin.Level
{
    /// <summary>
    /// Loads level JSON from StreamingAssets/Levels. Uses UnityWebRequest rather than
    /// File.ReadAllText because StreamingAssets is not a plain filesystem path on Android.
    /// </summary>
    public sealed class LevelFileLoader
    {
        public IEnumerator LoadLevelText(string fileName, Action<string> onLoaded, Action<string> onError)
        {
            string url = BuildUrl(Path.Combine("Levels", fileName));
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
