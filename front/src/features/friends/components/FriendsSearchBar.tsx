import { useTranslation } from 'react-i18next';
import styles from '../Friends.module.css';
import { CloseIcon } from '../../../types/icons';
import Button from '../../../components/ui/Button';

type InputProps = {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function FriendsSearchBar({ input, setInput }: InputProps) {
  const { t } = useTranslation();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-3 ${styles.searchBar}`}
    >
      <input
        maxLength={30}
        type="text"
        onChange={handleChange}
        value={input}
        placeholder={t('friendsSearchBar.placeholders.default')}
        className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black"
      />

      {input && (
        <Button
          variant="icon"
          type="button"
          aria-label={t('friendsSearchBar.clearInput')}
          onClick={() => setInput('')}
          className={`modal-button modal-close modal-button modal-close-inline-red relative! top-auto! right-auto! rounded-full! shrink-0 cursor-pointer active:scale-70 ${styles.searchClearButton}`}
        >
          <CloseIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
