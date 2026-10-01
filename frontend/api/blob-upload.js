import { handleUpload } from "@vercel/blob/client";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_UPLOAD_SIZE = 4 * 1024 * 1024;

function parseBody(body) {
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString("utf8"));
  if (typeof body === "string") return JSON.parse(body);
  return body;
}

async function getAuthenticatedUser(request) {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    const error = new Error("Sign in before uploading images.");
    error.statusCode = 401;
    throw error;
  }

  if (!process.env.AUTH_SERVICE_URL) {
    const error = new Error("Authentication service is not configured for uploads.");
    error.statusCode = 503;
    throw error;
  }

  const authUrl = process.env.AUTH_SERVICE_URL.replace(/\/+$/, "") + "/api/auth/me";
  const response = await fetch(authUrl, {
    headers: { Authorization: authorization },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    const error = new Error("Your session is invalid or expired. Sign in again.");
    error.statusCode = response.status === 401 ? 401 : 503;
    throw error;
  }

  return response.json();
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "Method not allowed." });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return response.status(503).json({ message: "Vercel Blob storage is not configured." });
  }

  try {
    const body = parseBody(request.body);
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const user = await getAuthenticatedUser(request);
        const payload = JSON.parse(clientPayload || "{}");
        const assetType = payload.assetType;
        const role = String(user.role || "").toUpperCase();
        const userId = String(user.userId ?? "");

        const typeAllowed =
          (assetType === "event" && role === "ADMIN") ||
          (assetType === "profile" && ["KAARIGAR", "VISITOR"].includes(role)) ||
          (assetType === "work" && role === "KAARIGAR");
        if (!userId || !typeAllowed) {
          const error = new Error("Your account cannot upload this kind of image.");
          error.statusCode = 403;
          throw error;
        }

        const prefix = "kaarigar-expo/" + userId + "/" + assetType + "/";
        const filename = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "";
        if (!/^[a-z0-9._-]{1,180}$/i.test(filename) || filename.includes("..")) {
          const error = new Error("Invalid image path.");
          error.statusCode = 400;
          throw error;
        }

        return {
          allowedContentTypes: IMAGE_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_SIZE,
          addRandomSuffix: true,
          validUntil: Date.now() + 10 * 60 * 1000,
          tokenPayload: JSON.stringify({ userId, role, assetType }),
        };
      },
    });

    return response.status(200).json(result);
  } catch (error) {
    const status = Number.isInteger(error.statusCode) ? error.statusCode : 400;
    return response.status(status).json({ message: error.message || "Image upload failed." });
  }
}
