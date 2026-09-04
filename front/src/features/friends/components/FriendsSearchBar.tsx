import { useTranslation } from 'react-i18next';
import type { ActionState } from './Friends';

type InputProps = ActionState & {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function FriendsSearchBar({ action, input, setInput }: InputProps) {
  const { t } = useTranslation();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  const placeholders: Record<string, string> = {
    add: t('friendsSearchBar.placeholders.add'),
    remove: t('friendsSearchBar.placeholders.remove'),
    request: t('friendsSearchBar.placeholders.request'),
    default: t('friendsSearchBar.placeholders.default'),
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2">
      <input
        maxLength={30}
        type="text"
        onChange={handleChange}
        value={input}
        placeholder={placeholders[action] || placeholders.default}
        className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black"
      />
      {input ? (
        <button
          type="button"
          aria-label={t('friendsSearchBar.clearInput')}
          onClick={() => setInput('')}
          className="modal-close modal-close-inline-red icon-btn relative! top-auto! right-2! rounded-full! shrink-0 cursor-pointer active:scale-70"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
