import type { ActionState } from './Friends';

type InputProps = ActionState & {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function FriendsSearchBar({ action, input, setInput }: InputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  const placeholders = {
    add: 'Add a friend...',
    remove: 'Remove a friend...',
    request: 'Search a friend...',
    default: 'Search a friend...',
  };

  return (
    <div className="flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-2">
      <input
        maxLength={30}
        type="text"

        onChange={handleChange}
        value={input}
        placeholder={placeholders[action]}
        className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black"
      />
      {input ? (
        <button
          type="button"
          aria-label="Close"
          onClick={() => setInput('')}
          className="glass-element icon-btn rounded-xl w-6 h-6 duration-150 cursor-pointer hover:text-white! active:scale-70"
        >
          <svg
          className="w-full h-full"
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
