import LoginButton from './Auth/Auth';

export default function BottomBar() {
  return (
    <div className="fixed bottom-2 w-full flex flex-row items-center justify-between px-6 py-3 z-500">
      <div className="flex items-center absolute bottom-0 left-1/2 -translate-x-1/2 gap-2">
        <LoginButton></LoginButton>
        <button className="glassmorphism-popup flex items-center justify-center h-10 w-10 cursor-pointer hover:zoom-98">
          <img src="https://img.icons8.com/?size=25&id=eMfeVHKyTnkc&format=png&color=000000"></img>
        </button>
      </div>
    </div>
  );
}
