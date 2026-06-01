// telegram.js
// Simple wrapper around Telegram WebApp API with graceful fallback.

const TelegramBridge = (() => {
  const isTelegram =
    typeof window !== "undefined" &&
    window.Telegram &&
    window.Telegram.WebApp;

  function sendData(payload) {
    const data =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    if (isTelegram) {
      try {
        window.Telegram.WebApp.sendData(data);
      } catch (e) {
        console.error("Telegram sendData failed:", e);
      }
    } else {
      console.log("[TelegramBridge] sendData:", data);
      alert("Workout complete.\n\nPayload:\n" + data);
    }
  }

  function close() {
    if (isTelegram) {
      try {
        window.Telegram.WebApp.close();
      } catch (e) {
        console.error("Telegram close failed:", e);
      }
    } else {
      console.log("[TelegramBridge] close()");
    }
  }

  function ready() {
    if (isTelegram) {
      try {
        window.Telegram.WebApp.ready();
      } catch (e) {
        console.error("Telegram ready failed:", e);
      }
    }
  }

  return { isTelegram, sendData, close, ready };
})();

window.TelegramBridge = TelegramBridge;
