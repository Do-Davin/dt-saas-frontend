import { useLanguageStore } from "../store/languageStore";
import type { Language } from "../types/digitalMenu.types";

const LANGS: { code: Language; flag: string; label: string }[] = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "kh", flag: "🇰🇭", label: "ភាសាខ្មែរ" },
];

export function LanguageSwitcher() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <div className="flex items-center rounded-md border p-0.5">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={label}
          className={[
            "rounded px-1.5 py-0.5 text-base leading-none transition-colors",
            language === code
              ? "bg-primary text-primary-foreground"
              : "opacity-50 hover:opacity-80",
          ].join(" ")}
        >
          {flag}
        </button>
      ))}
    </div>
  );
}
