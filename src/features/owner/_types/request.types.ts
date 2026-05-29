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
