// Shared image-file validation used by both the create-time staged picker
// (CreateProductImageField) and the edit-time uploader (ProductImageManager).

export const ACCEPTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const ACCEPTED_IMAGE_INPUT_ATTR = "image/jpeg,image/png,image/webp";

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const MAX_STAGED_IMAGES = 10;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_MIME_TYPES.has(file.type)) {
    return "File must be a JPEG, PNG, or WebP image.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "File is too large (max 10 MB).";
  }
  return null;
}
