import { useState } from 'react';

export default function UserSearch() {
  const [input, setInput] = useState('');

  return (
    <div className="flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-2">
      <input
	  	maxLength={30}
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Search user..."
        className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black"
      />
      {input ? (
        <button
          type="button"
          onClick={() => setInput('')}
          className="ml-2 text-sm text-black hover:text-black"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}