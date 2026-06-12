import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { serverEnv } from "@/config/env";

cloudinary.config({
  cloud_name: serverEnv.CLOUDINARY_CLOUD_NAME,
  api_key: serverEnv.CLOUDINARY_API_KEY,
  api_secret: serverEnv.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload a file buffer or remote URL to Cloudinary. Returns CDN-optimized URL.
 */
export async function uploadToCloudinary(
  fileOrUrl: string | Buffer,
  options: { folder?: string; publicId?: string; resourceType?: "image" | "video" | "raw" } = {}
): Promise<UploadResult> {
  const { folder = "wdd", publicId, resourceType = "image" } = options;

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    if (typeof fileOrUrl === "string") {
      cloudinary.uploader
        .upload(fileOrUrl, { folder, public_id: publicId, resource_type: resourceType })
        .then(resolve)
        .catch(reject);
    } else {
      const stream = cloudinary.uploader.upload_stream(
        { folder, public_id: publicId, resource_type: resourceType },
        (err, res) => {
          if (err || !res) reject(err ?? new Error("Cloudinary upload failed"));
          else resolve(res);
        }
      );
      stream.end(fileOrUrl);
    }
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function deleteFromCloudinary(publicId: string, resourceType: "image" | "video" | "raw" = "image") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export { cloudinary };
