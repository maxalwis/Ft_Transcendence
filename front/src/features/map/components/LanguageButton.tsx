import { useLanguage, type Lang } from '../../../context/language/LanguageContext';

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export default function LanguageButton() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex gap-1 rounded-full bg-white/90 p-1 shadow-md">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            lang === l.code ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
