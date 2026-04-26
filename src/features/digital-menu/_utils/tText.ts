import type { Language, LocalizedText } from "../_types/digitalMenu.types";

/** Resolve a LocalizedText to a plain string for the given language.
 *  Falls back to English if the requested language has no translation. */
export function tText(text: LocalizedText, lang: Language): string {
  return text[lang] ?? text.en;
}
