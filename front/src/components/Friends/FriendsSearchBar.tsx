import { useState } from 'react';
import type { ActionState } from './Friends';

export default function FriendsSearchBar( { action }: ActionState ) {

	const [input, setInput] = useState('');

	const placeholders = {
		add: 'Add a friend...',
		remove: 'Remove a friend...',
		request: 'Search a friend...',
		default: 'Search a friend...'
	}

	return (
	<div className="flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-2">
		<input
		maxLength={30}
		type="text"
		value={input}
		onChange={(event) => setInput(event.target.value)}
		placeholder={placeholders[action]}
		className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black"
		/>
		{input ? (
		<button
			type="button"
			onClick={() => setInput('')}
			className="glassmorphism-element border-slate-700! rounded-xl w-6 h-6 duration-150 cursor-pointer hover:bg-sky-900! hover:text-white! active:scale-70"
		>
			X
		</button>
		) : null}
	</div>
	);
}