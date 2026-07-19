using System;
using System.Collections.Generic;
using System.Text;

namespace Spin.Localization
{
    /// <summary>
    /// Parses a flat JSON object of string key -> string value pairs (§11.1). JsonUtility cannot
    /// deserialize into a Dictionary with arbitrary keys, so this is a small hand-rolled parser
    /// scoped to exactly that shape — no nested objects, arrays, numbers, or booleans.
    /// </summary>
    public static class LocalizationParser
    {
        public static Dictionary<string, string> Parse(string rawJson)
        {
            var result = new Dictionary<string, string>();
            int i = 0;

            SkipWhitespace(rawJson, ref i);
            Expect(rawJson, ref i, '{');
            SkipWhitespace(rawJson, ref i);

            if (Peek(rawJson, i) == '}')
                return result;

            while (true)
            {
                SkipWhitespace(rawJson, ref i);
                string key = ParseString(rawJson, ref i);
                SkipWhitespace(rawJson, ref i);
                Expect(rawJson, ref i, ':');
                SkipWhitespace(rawJson, ref i);
                string value = ParseString(rawJson, ref i);
                result[key] = value;

                SkipWhitespace(rawJson, ref i);
                char next = Peek(rawJson, i);
                if (next == ',')
                {
                    i++;
                    continue;
                }
                if (next == '}')
                {
                    i++;
                    break;
                }

                throw new FormatException($"Unexpected character '{next}' at position {i} while parsing localization JSON.");
            }

            return result;
        }

        private static string ParseString(string s, ref int i)
        {
            if (Peek(s, i) != '"')
                throw new FormatException($"Expected '\"' at position {i} while parsing localization JSON.");
            i++; // skip opening quote

            var sb = new StringBuilder();
            while (true)
            {
                if (i >= s.Length)
                    throw new FormatException("Unterminated string in localization JSON.");

                char c = s[i];
                if (c == '"')
                {
                    i++;
                    return sb.ToString();
                }

                if (c == '\\')
                {
                    i++;
                    if (i >= s.Length)
                        throw new FormatException("Unterminated escape sequence in localization JSON.");

                    char escaped = s[i];
                    switch (escaped)
                    {
                        case '"': sb.Append('"'); break;
                        case '\\': sb.Append('\\'); break;
                        case '/': sb.Append('/'); break;
                        case 'n': sb.Append('\n'); break;
                        case 'r': sb.Append('\r'); break;
                        case 't': sb.Append('\t'); break;
                        case 'b': sb.Append('\b'); break;
                        case 'f': sb.Append('\f'); break;
                        case 'u':
                            if (i + 4 >= s.Length)
                                throw new FormatException("Invalid unicode escape in localization JSON.");
                            string hex = s.Substring(i + 1, 4);
                            sb.Append((char)Convert.ToInt32(hex, 16));
                            i += 4;
                            break;
                        default:
                            throw new FormatException($"Unknown escape sequence '\\{escaped}' in localization JSON.");
                    }
                    i++;
                    continue;
                }

                sb.Append(c);
                i++;
            }
        }

        private static void SkipWhitespace(string s, ref int i)
        {
            while (i < s.Length && char.IsWhiteSpace(s[i])) i++;
        }

        private static char Peek(string s, int i) => i < s.Length ? s[i] : '\0';

        private static void Expect(string s, ref int i, char expected)
        {
            if (Peek(s, i) != expected)
                throw new FormatException($"Expected '{expected}' at position {i} while parsing localization JSON.");
            i++;
        }
    }
}
