import apiClient from "./client";

export async function uploadImage(file) {
  const maxUploadSize = 4 * 1024 * 1024;
  if (file.size > maxUploadSize) {
    throw new Error("Choose an image that is 4 MB or smaller.");
  }

  const body = new FormData();
  body.append("file", file);

  const response = await apiClient.post("/api/kaarigars/media", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.url;
}

export function resolveImageUrl(url) {
  if (!url) return "";
  if (/^(data:|https?:\/\/)/i.test(url)) return url;

  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  return new URL(url, baseUrl).toString();
}
