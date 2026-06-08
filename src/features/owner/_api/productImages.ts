// Owner product image API.
// Upload uses multipart/form-data; Axios sets Content-Type + boundary
// automatically when FormData is passed as `data` — do not set it manually.

import { ApiError } from "@/lib/api/client";
import { ownerApiFetch } from "./ownerApiFetch";

export interface ProductImage {
  id: string;
  productId: string;
  key?: string | null;
  url: string;
  alt?: string | null;
  position: number;
  isPrimary: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ProductImageRaw {
  id?: unknown;
  productId?: unknown;
  key?: unknown;
  url?: unknown;
  alt?: unknown;
  position?: unknown;
  isPrimary?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function isValidImage(v: unknown): v is ProductImageRaw {
  if (v === null || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    r.id.length > 0 &&
    typeof r.url === "string" &&
    r.url.length > 0
  );
}

function toImage(raw: ProductImageRaw): ProductImage {
  return {
    id: raw.id as string,
    productId: typeof raw.productId === "string" ? raw.productId : "",
    key: typeof raw.key === "string" ? raw.key : null,
    url: raw.url as string,
    alt: typeof raw.alt === "string" ? raw.alt : null,
    position: typeof raw.position === "number" ? raw.position : 0,
    isPrimary: typeof raw.isPrimary === "boolean" ? raw.isPrimary : false,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

function normalizeListResponse(body: unknown): ProductImage[] {
  if (Array.isArray(body)) {
    return body.filter(isValidImage).map(toImage);
  }
  if (body !== null && typeof body === "object") {
    const r = body as Record<string, unknown>;
    for (const key of ["content", "data", "items", "images"] as const) {
      if (Array.isArray(r[key])) {
        return (r[key] as unknown[]).filter(isValidImage).map(toImage);
      }
    }
  }
  return [];
}

function normalizeDetailResponse(body: unknown): ProductImage {
  if (body !== null && typeof body === "object") {
    const r = body as Record<string, unknown>;
    for (const key of ["data", "image"] as const) {
      if (isValidImage(r[key])) return toImage(r[key] as ProductImageRaw);
    }
    if (isValidImage(body)) return toImage(body as ProductImageRaw);
  }
  throw new ApiError(0, "Unexpected response shape from image endpoint.");
}

// Confirmed endpoint paths:
//   GET    /businesses/{businessId}/products/{productId}/images
//   POST   /businesses/{businessId}/products/{productId}/images/upload
//   DELETE /businesses/{businessId}/products/{productId}/images/{imageId}
//   POST   /businesses/{businessId}/products/{productId}/images/{imageId}/set-primary

function imageBase(businessId: string, productId: string) {
  return `/businesses/${encodeURIComponent(businessId)}/products/${encodeURIComponent(productId)}/images`;
}

export async function listProductImages(
  businessId: string,
  productId: string
): Promise<ProductImage[]> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: imageBase(businessId, productId),
  });
  return normalizeListResponse(body);
}

export async function uploadProductImage(
  businessId: string,
  productId: string,
  file: File
): Promise<ProductImage> {
  const formData = new FormData();
  formData.append("file", file);
  // Do NOT set Content-Type header — Axios detects FormData and adds the
  // correct multipart boundary automatically.
  const body = await ownerApiFetch<unknown>({
    method: "POST",
    url: `${imageBase(businessId, productId)}/upload`,
    data: formData,
  });
  return normalizeDetailResponse(body);
}

// DELETE may return 200 + body or 204 (no body); response is ignored.
export async function deleteProductImage(
  businessId: string,
  productId: string,
  imageId: string
): Promise<void> {
  await ownerApiFetch<unknown>({
    method: "DELETE",
    url: `${imageBase(businessId, productId)}/${encodeURIComponent(imageId)}`,
  });
}

// POST with no body; response is ignored — caller refetches the list.
export async function setProductImagePrimary(
  businessId: string,
  productId: string,
  imageId: string
): Promise<void> {
  await ownerApiFetch<unknown>({
    method: "POST",
    url: `${imageBase(businessId, productId)}/${encodeURIComponent(imageId)}/set-primary`,
  });
}
