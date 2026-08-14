import { useState } from "react";

export default function SearchFriends()
{
	const [search, setSearch] = useState('');
	function handleChange(e) {
		setSearch(e.target.value);
	}

	<input onChange={handleChange}> </input>
	return (

	);
}