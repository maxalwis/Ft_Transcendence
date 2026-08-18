export default function NavBar()
{
	return (
	<div className="fixed top-2 w-full flex flex-row items-center justify-between px-6 py-3 z-500">
		<div className="flex items-center absolute top-2 left-1/20">
			<button
				className=" h-10 w-25 cursor-pointer rounded-full text-white bg-sky-600 duration-300 hover:zoom-98">
				{/* onClick= */}
				Connexion</button>
		</div>

		<nav className="flex items-center gap-3 absolute top-2 left-1/2 -translate-x-1/2">
			<button className="glassmorphism-popup h-10 w-20 cursor-pointer hover:zoom-98">
				Culture</button>
			<button className="glassmorphism-popup h-10 w-20 cursor-pointer hover:zoom-98">
				Sports</button>
			<button className="glassmorphism-popup h-10 w-20 cursor-pointer hover:zoom-98">
				Music</button>
			<button className="glassmorphism-popup h-10 w-20 cursor-pointer hover:zoom-98">
				Family</button>
		</nav>
	</div>
	);
}