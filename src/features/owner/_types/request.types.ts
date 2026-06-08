// Frontend types for owner-facing customer requests.
//
// Customer Request = a signal of what a customer wants. It is NOT a POS sale,
// NOT a payment, NOT a fulfillment record, NOT analytics. Keep this file scoped
// accordingly — no order totals, no payment fields, no kitchen state.
//
// Backend response shapes are not yet pinned at the field level. Fields likely
// to be required at runtime are non-optional; everything else is optional so a
// minor backend change cannot crash the list page.

export type RequestStatus =
  | "NEW"
  | "SEEN"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type RequestType =
  | "ORDER"
  | "INQUIRY"
  | "BOOKING"
  | "SERVICE_REQUEST";

export interface CustomerRequestItemSummary {
  id?: string;
  name?: string;
  quantity?: number;
}

export interface CustomerRequestListItem {
  id: string;
  type: RequestType;
  status: RequestStatus;
  customerName?: string;
  customerPhone?: string;
  customerNote?: string;
  branchId?: string;
  branchName?: string;
  // ISO 8601 string from the backend.
  createdAt: string;
  items?: CustomerRequestItemSummary[];
}

// Detail-page item. Includes price snapshots the list does not surface.
// Snapshot fields are intentionally numbers, not Money objects — currency is
// not yet on the type. When currency is added to the response, wire Intl
// formatting at the component boundary, not here.
export interface CustomerRequestDetailItem {
  id?: string;
  productId?: string;
  productNameSnapshot?: string;
  salesPriceSnapshot?: number;
  pricingTypeSnapshot?: string;
  quantity?: number;
  note?: string;
}

export interface CustomerRequestDetail {
  id: string;
  type: RequestType;
  status: RequestStatus;
  customerName?: string;
  customerPhone?: string;
  customerNote?: string;
  branchId?: string;
  branchName?: string;
  createdAt: string;
  updatedAt?: string;
  items?: CustomerRequestDetailItem[];
}
