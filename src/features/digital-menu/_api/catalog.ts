// Public catalog API.
//
// NEVER imports from features/owner.
// NEVER uses withOwnerAuthHeaders() — public catalog calls must not carry
// the owner JWT. apiFetch has no global request interceptor that attaches
// auth, so calling apiFetch directly is safe.
//
// Confirmed Spring Boot endpoint paths (base URL already includes /api):
//   GET /catalog/{slug}            → { business, branches, categories }
//   GET /catalog/{slug}/products   → { items, pagination }
//
// /catalog/{slug} does NOT return products. The single-product detail
// endpoint (/catalog/{slug}/products/{productId}) is not wired here yet:
// the ProductDetailModal reads from already-loaded products in the store,
// so no per-product fetch is required by current UI.

import { apiFetch } from "@/lib/api/client";
import type {
  Availability,
  Business,
  Category,
  LocalizedText,
  Product,
} from "../_types/digitalMenu.types";

// ─── Defaults ────────────────────────────────────────────────────────────────

// Business.availability is required by the UI type but is not part of the
// catalog shell response today. An empty schedule with no temporary closure
// is the safe "always-open / unknown" fallback.
const DEFAULT_AVAILABILITY: Availability = {
  schedule: [],
  isTemporarilyUnavailable: false,
};

// ─── Permissive raw DTOs ─────────────────────────────────────────────────────
// All non-required fields typed as `unknown` so the normalizers below decide
// what to forward — unknown backend fields are dropped rather than passed
// through verbatim.

interface BusinessRaw {
  id?: unknown;
  slug?: unknown;
  name?: unknown;
  nameKm?: unknown;
  type?: unknown;
  description?: unknown;
  descriptionKm?: unknown;
  currency?: unknown;
  logoUrl?: unknown;
  coverImageUrl?: unknown;
  heroImages?: unknown;
  cuisineTypes?: unknown;
}

interface CategoryRaw {
  id?: unknown;
  businessId?: unknown;
  name?: unknown;
  nameKm?: unknown;
  description?: unknown;
  descriptionKm?: unknown;
  imageUrl?: unknown;
  position?: unknown;
}

interface ProductRaw {
  id?: unknown;
  categoryId?: unknown;
  name?: unknown;
  nameKm?: unknown;
  description?: unknown;
  descriptionKm?: unknown;
  price?: unknown;
  salesPrice?: unknown;
  imageUrl?: unknown;
  isAvailable?: unknown;
  position?: unknown;
}

interface CatalogShellRaw {
  business?: BusinessRaw;
  branches?: unknown;
  categories?: CategoryRaw[];
}

interface CatalogProductsRaw {
  items?: ProductRaw[];
  pagination?: unknown;
}

// ─── Field extractors ────────────────────────────────────────────────────────

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function asNumber(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function asBoolean(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.filter((x): x is string => typeof x === "string" && x.length > 0);
  return out.length > 0 ? out : undefined;
}

function toLocalizedText(
  en: unknown,
  kh: unknown
): LocalizedText | undefined {
  const enStr = asString(en);
  if (!enStr) return undefined;
  const khStr = asString(kh);
  return khStr ? { en: enStr, kh: khStr } : { en: enStr };
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

function toBusiness(raw: BusinessRaw, fallbackSlug: string): Business | null {
  const id = asString(raw.id);
  const name = asString(raw.name);
  if (!id || !name) return null;

  const description = toLocalizedText(raw.description, raw.descriptionKm);

  return {
    id,
    slug: asString(raw.slug) ?? fallbackSlug,
    name,
    businessType: asString(raw.type),
    currency: asString(raw.currency) ?? "USD",
    availability: DEFAULT_AVAILABILITY,
    logoUrl: asString(raw.logoUrl),
    coverImageUrl: asString(raw.coverImageUrl),
    heroImages: asStringArray(raw.heroImages),
    cuisineTypes: asStringArray(raw.cuisineTypes),
    description,
  };
}

function toCategory(raw: CategoryRaw, businessId: string): Category | null {
  const id = asString(raw.id);
  const name = toLocalizedText(raw.name, raw.nameKm);
  if (!id || !name) return null;

  return {
    id,
    businessId: asString(raw.businessId) ?? businessId,
    name,
    description: toLocalizedText(raw.description, raw.descriptionKm),
    imageUrl: asString(raw.imageUrl),
    position: asNumber(raw.position) ?? 0,
  };
}

function toProduct(raw: ProductRaw): Product | null {
  const id = asString(raw.id);
  const categoryId = asString(raw.categoryId);
  const name = toLocalizedText(raw.name, raw.nameKm);
  // Backend may use either `price` or `salesPrice` (snapshot convention
  // mirrored on the owner Customer Request side).
  const price = asNumber(raw.price) ?? asNumber(raw.salesPrice);
  if (!id || !categoryId || !name || price === undefined) return null;

  return {
    id,
    categoryId,
    name,
    description: toLocalizedText(raw.description, raw.descriptionKm),
    price,
    imageUrl: asString(raw.imageUrl),
    isAvailable: asBoolean(raw.isAvailable) ?? true,
    position: asNumber(raw.position) ?? 0,
  };
}

// ─── Endpoint helpers ────────────────────────────────────────────────────────

export interface CatalogShell {
  business: Business;
  categories: Category[];
}

// GET /catalog/{slug}. Returns business + categories (branches are dropped
// for now — the public UI does not use them yet).
export async function getCatalogShell(slug: string): Promise<CatalogShell> {
  const body = await apiFetch<CatalogShellRaw>({
    method: "GET",
    url: `/catalog/${encodeURIComponent(slug)}`,
  });

  const business = body.business ? toBusiness(body.business, slug) : null;
  if (!business) {
    throw new Error("Catalog response is missing a valid business.");
  }

  const rawCategories = Array.isArray(body.categories) ? body.categories : [];
  const categories = rawCategories
    .map((c) => toCategory(c, business.id))
    .filter((c): c is Category => c !== null)
    .sort((a, b) => a.position - b.position);

  return { business, categories };
}

// GET /catalog/{slug}/products. Pagination is not yet wired into the UI —
// this returns the first page's items and discards the pagination envelope.
// When server-side filtering / paging lands, expose page params on this
// helper and add a hook variant that accumulates pages.
export async function getCatalogProducts(slug: string): Promise<Product[]> {
  const body = await apiFetch<CatalogProductsRaw>({
    method: "GET",
    url: `/catalog/${encodeURIComponent(slug)}/products`,
  });

  const rawItems = Array.isArray(body.items) ? body.items : [];
  return rawItems
    .map(toProduct)
    .filter((p): p is Product => p !== null)
    .sort((a, b) => a.position - b.position);
}
