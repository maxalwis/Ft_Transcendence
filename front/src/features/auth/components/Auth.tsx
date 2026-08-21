export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = `https://localhost:${import.meta.env.HTTPS_PORT || 8443}/login/`;
  };

  return (
    <button
      className="glass-panel h-10 w-25 cursor-pointer rounded-full text-white bg-sky-600 duration-300 hover:zoom-98"
      onClick={handleLogin}
    >
      Connexion
    </button>
  );
}
