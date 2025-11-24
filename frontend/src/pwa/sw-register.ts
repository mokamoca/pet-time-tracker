export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch (err) {
      console.error("Service worker registration failed", err);
    }
  }
};
