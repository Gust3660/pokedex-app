import { useEffect, useState } from "react";
import { Download } from "lucide-react";

const Header = () => {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => setInstallPrompt(null);

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 bg-red-900 p-4 text-white shadow">
      <span className="text-2xl font-bold">Pokédex</span>

      {installPrompt && (
        <button
          type="button"
          onClick={installApp}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-red-900 transition hover:bg-red-50"
        >
          <Download size={18} aria-hidden="true" />
          Instalar
        </button>
      )}
    </header>
  );
};

export default Header;
