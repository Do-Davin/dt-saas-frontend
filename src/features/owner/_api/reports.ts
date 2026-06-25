// Owner Reports API.
// Endpoint paths confirmed from Spring Boot backend:
//   GET /businesses/{businessId}/reports/sales-summary
//   GET /businesses/{businessId}/reports/sales-by-category
//   GET /businesses/{businessId}/reports/sales-by-product

import { ownerApiFetch } from "./ownerApiFetch";

export interface SalesSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  saleCount: number;
}

export interface CategoryRevenue {
  categoryId: string | null;
  categoryName: string | null;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  quantity: number;
}

export interface ProductRevenue {
  productId: string | null;
  productName: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  quantity: number;
}

export interface ReportParams {
  from?: string;
  to?: string;
  branchId?: string;
}

function buildQuery(params?: ReportParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const q: Record<string, string> = {};
  if (params.from) q.from = params.from;
  if (params.to) q.to = params.to;
  if (params.branchId) q.branchId = params.branchId;
  return Object.keys(q).length > 0 ? q : undefined;
}

export async function getSalesSummary(
  businessId: string,
  params?: ReportParams,
): Promise<SalesSummary> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/reports/sales-summary`,
    params: buildQuery(params),
  });
  return body as SalesSummary;
}

export async function getSalesByCategory(
  businessId: string,
  params?: ReportParams,
): Promise<CategoryRevenue[]> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/reports/sales-by-category`,
    params: buildQuery(params),
  });
  return Array.isArray(body) ? (body as CategoryRevenue[]) : [];
}

export async function getSalesByProduct(
  businessId: string,
  params?: ReportParams,
): Promise<ProductRevenue[]> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/reports/sales-by-product`,
    params: buildQuery(params),
  });
  return Array.isArray(body) ? (body as ProductRevenue[]) : [];
}
