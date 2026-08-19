import LoginButton from "./Auth/Auth";

export default function BottomBar()
{
	return (
	<div className="fixed bottom-2 w-full flex flex-row items-center justify-between px-6 py-3 z-500">
		<div className="flex items-center absolute bottom-0 left-1/2 -translate-x-1/2 gap-2">
			<LoginButton></LoginButton>
		<button className="glassmorphism-popup h-10 w-20 cursor-pointer hover:zoom-98">
			🔔</button>
		</div>
	</div>
	);
}