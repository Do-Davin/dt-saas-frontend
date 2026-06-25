// Owner product API.
// Only fields confirmed in the Spring Boot contract are mapped;
// any additional backend fields are dropped by toProduct().

import { ApiError } from "@/lib/api/client";
import { ownerApiFetch } from "./ownerApiFetch";

export type PricingType =
  | "FIXED"
  | "NO_PRICE"
  | "STARTING_FROM"
  | "CONTACT_FOR_PRICE";

export type UnitOfMeasure =
  | "EACH"
  | "KG"
  | "GRAM"
  | "LITER"
  | "ML"
  | "METER"
  | "BOX"
  | "PACK"
  | "SET"
  | "HOUR"
  | "DAY";

export interface ProductPrimaryImage {
  id: string;
  url: string;
  alt: string | null;
}

export interface Product {
  id: string;
  businessId: string;
  branchId?: string | null;
  categoryId?: string | null;
  name: string;
  nameKm?: string | null;
  description?: string | null;
  descriptionKm?: string | null;
  purchasePrice?: number | null;
  salesPrice?: number | null;
  discount?: number | null;
  label?: string | null;
  unitOfMeasure?: UnitOfMeasure | null;
  pricingType?: PricingType | null;
  isAvailable: boolean;
  isVisible: boolean;
  stockQuantity: number;
  lowStockThreshold: number | null;
  primaryImage: ProductPrimaryImage | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type StockAdjustmentReason = "RESTOCK" | "CORRECTION" | "WASTE";

export interface AdjustStockInput {
  adjustment: number;
  reason: StockAdjustmentReason;
}

export interface ProductInput {
  name: string;
  nameKm?: string;
  description?: string;
  descriptionKm?: string;
  categoryId?: string;
  branchId?: string;
  purchasePrice?: number;
  salesPrice?: number;
  discount?: number;
  label?: string;
  unitOfMeasure?: UnitOfMeasure;
  pricingType?: PricingType;
  isAvailable?: boolean;
  isVisible?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export interface ListProductsOptions {
  branchId?: string;
  categoryId?: string;
}

interface ProductRaw {
  id?: unknown;
  businessId?: unknown;
  branchId?: unknown;
  categoryId?: unknown;
  name?: unknown;
  nameKm?: unknown;
  description?: unknown;
  descriptionKm?: unknown;
  purchasePrice?: unknown;
  salesPrice?: unknown;
  discount?: unknown;
  label?: unknown;
  unitOfMeasure?: unknown;
  pricingType?: unknown;
  isAvailable?: unknown;
  isVisible?: unknown;
  stockQuantity?: unknown;
  lowStockThreshold?: unknown;
  primaryImage?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function parsePrimaryImage(v: unknown): ProductPrimaryImage | null {
  if (v === null || typeof v !== "object") return null;
  const r = v as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.url !== "string") return null;
  return {
    id: r.id,
    url: r.url,
    alt: typeof r.alt === "string" ? r.alt : null,
  };
}

const VALID_PRICING_TYPES = new Set<string>([
  "FIXED",
  "NO_PRICE",
  "STARTING_FROM",
  "CONTACT_FOR_PRICE",
]);

const VALID_UNITS = new Set<string>([
  "EACH",
  "KG",
  "GRAM",
  "LITER",
  "ML",
  "METER",
  "BOX",
  "PACK",
  "SET",
  "HOUR",
  "DAY",
]);

function isValidProduct(v: unknown): v is ProductRaw {
  if (v === null || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    r.id.length > 0 &&
    typeof r.name === "string" &&
    r.name.length > 0
  );
}

function toProduct(raw: ProductRaw): Product {
  const pricingType =
    typeof raw.pricingType === "string" &&
    VALID_PRICING_TYPES.has(raw.pricingType)
      ? (raw.pricingType as PricingType)
      : null;

  const unitOfMeasure =
    typeof raw.unitOfMeasure === "string" && VALID_UNITS.has(raw.unitOfMeasure)
      ? (raw.unitOfMeasure as UnitOfMeasure)
      : null;

  return {
    id: raw.id as string,
    businessId: typeof raw.businessId === "string" ? raw.businessId : "",
    branchId: typeof raw.branchId === "string" ? raw.branchId : null,
    categoryId: typeof raw.categoryId === "string" ? raw.categoryId : null,
    name: raw.name as string,
    nameKm: typeof raw.nameKm === "string" ? raw.nameKm : null,
    description: typeof raw.description === "string" ? raw.description : null,
    descriptionKm:
      typeof raw.descriptionKm === "string" ? raw.descriptionKm : null,
    purchasePrice:
      typeof raw.purchasePrice === "number" ? raw.purchasePrice : null,
    salesPrice: typeof raw.salesPrice === "number" ? raw.salesPrice : null,
    discount: typeof raw.discount === "number" ? raw.discount : null,
    label: typeof raw.label === "string" ? raw.label : null,
    unitOfMeasure,
    pricingType,
    isAvailable:
      typeof raw.isAvailable === "boolean" ? raw.isAvailable : true,
    isVisible: typeof raw.isVisible === "boolean" ? raw.isVisible : true,
    stockQuantity: typeof raw.stockQuantity === "number" ? raw.stockQuantity : 0,
    lowStockThreshold:
      typeof raw.lowStockThreshold === "number" ? raw.lowStockThreshold : null,
    primaryImage: parsePrimaryImage(raw.primaryImage),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

function normalizeListResponse(body: unknown): Product[] {
  if (Array.isArray(body)) {
    return body.filter(isValidProduct).map(toProduct);
  }
  if (body !== null && typeof body === "object") {
    const r = body as Record<string, unknown>;
    for (const key of ["content", "data", "items", "products"] as const) {
      if (Array.isArray(r[key])) {
        return (r[key] as unknown[]).filter(isValidProduct).map(toProduct);
      }
    }
  }
  return [];
}

function normalizeDetailResponse(body: unknown): Product {
  if (body !== null && typeof body === "object") {
    const r = body as Record<string, unknown>;
    for (const key of ["data", "product"] as const) {
      if (isValidProduct(r[key])) return toProduct(r[key] as ProductRaw);
    }
    if (isValidProduct(body)) return toProduct(body as ProductRaw);
  }
  throw new ApiError(0, "Unexpected response shape from product endpoint.");
}

// Confirmed endpoint paths:
//   GET    /businesses/{businessId}/products[?branchId=&categoryId=]
//   GET    /businesses/{businessId}/products/{productId}
//   POST   /businesses/{businessId}/products
//   PATCH  /businesses/{businessId}/products/{productId}
//   DELETE /businesses/{businessId}/products/{productId}

export async function listProducts(
  businessId: string,
  options?: ListProductsOptions
): Promise<Product[]> {
  const params: Record<string, string> = {};
  if (options?.branchId) params.branchId = options.branchId;
  if (options?.categoryId) params.categoryId = options.categoryId;

  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/products`,
    params: Object.keys(params).length > 0 ? params : undefined,
  });
  return normalizeListResponse(body);
}

export async function getProduct(
  businessId: string,
  productId: string
): Promise<Product> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/products/${encodeURIComponent(productId)}`,
  });
  return normalizeDetailResponse(body);
}

export async function createProduct(
  businessId: string,
  input: ProductInput
): Promise<Product> {
  const body = await ownerApiFetch<unknown>({
    method: "POST",
    url: `/businesses/${encodeURIComponent(businessId)}/products`,
    data: input,
  });
  return normalizeDetailResponse(body);
}

export async function updateProduct(
  businessId: string,
  productId: string,
  input: ProductInput
): Promise<Product> {
  const body = await ownerApiFetch<unknown>({
    method: "PATCH",
    url: `/businesses/${encodeURIComponent(businessId)}/products/${encodeURIComponent(productId)}`,
    data: input,
  });
  return normalizeDetailResponse(body);
}

export async function adjustStock(
  businessId: string,
  productId: string,
  input: AdjustStockInput
): Promise<Product> {
  const body = await ownerApiFetch<unknown>({
    method: "PATCH",
    url: `/businesses/${encodeURIComponent(businessId)}/products/${encodeURIComponent(productId)}/stock`,
    data: input,
  });
  return normalizeDetailResponse(body);
}

// DELETE may return 200 + body or 204 (no body); response is ignored.
export async function deleteProduct(
  businessId: string,
  productId: string
): Promise<void> {
  await ownerApiFetch<unknown>({
    method: "DELETE",
    url: `/businesses/${encodeURIComponent(businessId)}/products/${encodeURIComponent(productId)}`,
  });
}
