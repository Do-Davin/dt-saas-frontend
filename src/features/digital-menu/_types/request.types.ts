// Public catalog request types.
//
// These are PUBLIC types. They live in features/digital-menu and must NOT
// import from features/owner. The public catalog never attaches the owner
// JWT, so its types stay scoped to what an anonymous customer can send.

export type PublicRequestType =
  | "ORDER"
  | "INQUIRY"
  | "BOOKING"
  | "SERVICE_REQUEST";

export interface CreateCatalogRequestInputItem {
  productId: string;
  quantity: number;
  note?: string;
}

export interface CreateCatalogRequestInput {
  type: PublicRequestType;
  customerName: string;
  customerPhone: string;
  customerNote?: string;
  items: CreateCatalogRequestInputItem[];
}

// Backend response shape is not pinned yet. The form only reads optional
// `id` / `reference` for UX; both are tolerated when missing.
export interface CreateCatalogRequestResult {
  id?: string;
  reference?: string;
}
