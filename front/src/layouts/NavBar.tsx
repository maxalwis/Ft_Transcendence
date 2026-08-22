export default function NavBar()
{
	return (
	<div className="fixed top-2 w-full flex flex-row items-center justify-between px-6 py-3 z-500">
		<nav className="flex items-center gap-3 absolute top-2 left-1/2 -translate-x-1/2">
            <button className="glass-panel cursor-pointer hover:zoom-98">
				All</button>
			<button className="glass-panel cursor-pointer hover:zoom-98">
				Culture</button>
			<button className="glass-panel cursor-pointer hover:zoom-98">
				Sports</button>
			<button className="glass-panel cursor-pointer hover:zoom-98">
				Music</button>
			<button className="glass-panel cursor-pointer hover:zoom-98">
				Family</button>
		</nav>
	</div>
	);
}