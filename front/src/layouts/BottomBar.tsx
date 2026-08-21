import LoginButton from "../features/auth/components/Auth";

export default function BottomBar()
{
	return (
	<div className="fixed bottom-2 w-full flex flex-row items-center justify-between px-6 py-3 z-500">
		<div className="flex items-center absolute bottom-0 left-1/2 -translate-x-1/2 gap-2">
			<LoginButton></LoginButton>
		<button
			className="glass-panel flex items-center justify-center h-10 w-10 cursor-pointer hover:zoom-98">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
		</button>
		</div>
	</div>
	);
}