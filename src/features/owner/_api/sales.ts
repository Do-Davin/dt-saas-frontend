// Owner Sales API.
// Endpoint paths confirmed from Spring Boot backend:
//   GET  /businesses/{businessId}/sales
//   GET  /businesses/{businessId}/sales/{saleId}
//   POST /businesses/{businessId}/sales

import { ApiError } from "@/lib/api/client";
import { ownerApiFetch } from "./ownerApiFetch";

export interface SaleItem {
  id: string;
  productId: string | null;
  productNameSnapshot: string;
  categoryIdSnapshot: string | null;
  categoryNameSnapshot: string | null;
  quantity: number;
  unitSalesPrice: number;
  unitCostPrice: number;
  discountAmount: number;
  lineTotal: number;
  lineCost: number;
  createdAt: string;
}

export interface Sale {
  id: string;
  businessId: string;
  branchId: string | null;
  saleDate: string;
  totalAmount: number;
  totalCost: number;
  profit: number;
  note: string | null;
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleListItem {
  id: string;
  branchId: string | null;
  saleDate: string;
  totalAmount: number;
  totalCost: number;
  profit: number;
  itemCount: number;
  note: string | null;
  createdAt: string;
}

export interface SalePageResponse {
  items: SaleListItem[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSaleItemInput {
  productId: string;
  quantity: number;
  unitSalesPrice?: number;
  unitCostPrice?: number;
  discountAmount?: number;
}

export interface CreateSaleInput {
  branchId?: string;
  saleDate?: string;
  note?: string;
  items: CreateSaleItemInput[];
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function normalizeDetail(body: unknown): Sale {
  if (isObject(body)) {
    for (const key of ["data", "sale"] as const) {
      if (isObject(body[key])) return body[key] as unknown as Sale;
    }
    return body as unknown as Sale;
  }
  throw new ApiError(0, "Unexpected response shape from sale endpoint.");
}

function normalizeList(body: unknown): SalePageResponse {
  if (isObject(body) && Array.isArray((body as Record<string, unknown>)["items"])) {
    return body as unknown as SalePageResponse;
  }
  if (Array.isArray(body)) {
    return {
      items: body as SaleListItem[],
      pagination: { page: 0, size: body.length, total: body.length, totalPages: 1 },
    };
  }
  return { items: [], pagination: { page: 0, size: 0, total: 0, totalPages: 0 } };
}

export async function listSales(
  businessId: string,
  params?: { from?: string; to?: string; branchId?: string; page?: number; size?: number },
): Promise<SalePageResponse> {
  const query: Record<string, string> = {};
  if (params?.from) query.from = params.from;
  if (params?.to) query.to = params.to;
  if (params?.branchId) query.branchId = params.branchId;
  if (params?.page !== undefined) query.page = String(params.page);
  if (params?.size !== undefined) query.size = String(params.size);

  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/sales`,
    params: Object.keys(query).length > 0 ? query : undefined,
  });
  return normalizeList(body);
}

export async function getSale(businessId: string, saleId: string): Promise<Sale> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/sales/${encodeURIComponent(saleId)}`,
  });
  return normalizeDetail(body);
}

export async function createSale(
  businessId: string,
  input: CreateSaleInput,
): Promise<Sale> {
  const body = await ownerApiFetch<unknown>({
    method: "POST",
    url: `/businesses/${encodeURIComponent(businessId)}/sales`,
    data: input,
  });
  return normalizeDetail(body);
}
