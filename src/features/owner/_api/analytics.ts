// Owner Analytics API.
// Endpoint confirmed from Spring Boot backend:
//   GET /businesses/{businessId}/analytics/overview?period=THIS_MONTH

import { ownerApiFetch } from "./ownerApiFetch";

export type AnalyticsPeriod =
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "LAST_30_DAYS"
  | "ALL_TIME";

export interface TopProduct {
  productId: string | null;
  name: string;
  quantity: number;
  revenue: number;
}

export interface CategoryShare {
  categoryId: string | null;
  name: string;
  revenue: number;
  percentage: number;
}

export interface StockAlert {
  productId: string;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number | null;
}

export interface AnalyticsOverview {
  period: string;
  income: number;
  cost: number;
  profit: number;
  saleCount: number;
  topSellingProducts: TopProduct[];
  salesByCategory: CategoryShare[];
  stockAlerts: StockAlert[];
}

export async function getAnalyticsOverview(
  businessId: string,
  period: AnalyticsPeriod = "THIS_MONTH",
): Promise<AnalyticsOverview> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/analytics/overview`,
    params: { period },
  });
  return body as AnalyticsOverview;
}
