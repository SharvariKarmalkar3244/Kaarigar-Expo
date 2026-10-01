export function showToast(message, type = "info") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));
  }
}
