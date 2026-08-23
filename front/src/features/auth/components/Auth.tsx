export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = `https://localhost:${import.meta.env.HTTPS_PORT || 8443}/login/`;
  };

  return (
    <button
      className="glass-panel cursor-pointer rounded-full duration-300 hover:zoom-98"
      onClick={handleLogin}
    >
      Login
    </button>
  );
}
