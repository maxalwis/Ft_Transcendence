export default function LoginButton()
{
	const handleLogin = () => {
		window.location.href = "https://localhost:8443/auth/42";
		window.location.href = "http://localhost:5173/auth/42";
	};

	return (
	<button
	className=" h-10 w-25 cursor-pointer rounded-full text-white bg-sky-600 duration-300 hover:zoom-98"
	onClick={handleLogin}>
		Connexion
	</button>
	);
}