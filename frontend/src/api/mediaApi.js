import { upload } from "@vercel/blob/client";
import apiClient from "./client";

const MAX_UPLOAD_SIZE = 4 * 1024 * 1024;

export async function uploadImage(file, assetType = "profile") {
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Choose an image that is 4 MB or smaller.");
  }

  if (import.meta.env.VITE_MEDIA_STORAGE === "vercel-blob") {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.userId ?? user?.id;
    if (!token || !userId) {
      throw new Error("Sign in before uploading images.");
    }
    if (!["profile", "work", "event"].includes(assetType)) {
      throw new Error("Unsupported image type.");
    }

    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/\.{2,}/g, ".");
    const uploadId = globalThis.crypto?.randomUUID?.() || Date.now() + "-" + Math.random().toString(16).slice(2);
    const pathname = "kaarigar-expo/" + userId + "/" + assetType + "/" + uploadId + "-" + (safeName || "image");
    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/blob-upload",
      clientPayload: JSON.stringify({ assetType }),
      headers: { Authorization: "Bearer " + token },
    });
    return blob.url;
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
