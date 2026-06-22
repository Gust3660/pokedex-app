export const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

  window.addEventListener("load", () => {
    const baseUrl = import.meta.env.BASE_URL;

    navigator.serviceWorker
      .register(`${baseUrl}sw.js`, { scope: baseUrl })
      .catch((error) => console.error("No se pudo registrar la PWA:", error));
  });
};
