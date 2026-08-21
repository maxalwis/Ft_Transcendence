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
          onClick={() => setInput('')}
          className="glass-panel border-slate-700! rounded-xl w-6 h-6 duration-150 cursor-pointer hover:text-white! active:scale-70"
        >
          X
        </button>
      ) : null}
    </div>
  );
}
