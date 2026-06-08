import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getCatalogShell, getCatalogProducts } from "../_api/catalog";
import type {
  Business,
  Category,
  Product,
} from "../_types/digitalMenu.types";

// Discriminated state for the public catalog page.
// `idle`     — no slug yet (defensive: the route always supplies one)
// `loading`  — slug present, fetch in flight, no settled result for it
// `notFound` — backend returned 404 for the shell endpoint (unknown slug)
// `error`    — any other failure (network, 5xx, malformed shape)
// `ready`    — shell + products both resolved successfully
export type CatalogState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      business: Business;
      categories: Category[];
      products: Product[];
    };

type SettledState = Exclude<CatalogState, { status: "idle" } | { status: "loading" }>;

// Loads catalog shell + products in parallel and exposes a discriminated
// state. Pass an empty string when no slug is available — the hook returns
// "idle" and never issues a request.
//
// Server state lives in this hook (useState) on purpose. It is page-local;
// no other page consumes the catalog today, so promoting it into Zustand
// would add coordination cost without any sharing benefit. If a future
// feature needs cross-page sharing, invalidation, or refetching, migrate
// to TanStack Query rather than reinventing a cache in Zustand.
//
// Lint-compliance note (react-hooks/set-state-in-effect): the effect does
// NOT call setState synchronously in its body. The visible "idle" and
// "loading" states are *derived* from `slug` and from whether the most
// recent settled fetch was for the current `slug`. Only the async
// resolution of the parallel fetch writes state, tagged with `forSlug` so
// a stale resolution can never leak onto a different slug's view.
export function useCatalog(slug: string): CatalogState {
  const [fetched, setFetched] = useState<
    { forSlug: string; state: SettledState } | null
  >(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    Promise.all([getCatalogShell(slug), getCatalogProducts(slug)])
      .then(([shell, products]) => {
        if (cancelled) return;
        setFetched({
          forSlug: slug,
          state: {
            status: "ready",
            business: shell.business,
            categories: shell.categories,
            products,
          },
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setFetched({ forSlug: slug, state: { status: "notFound" } });
          return;
        }
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Something went wrong while loading the menu.";
        setFetched({
          forSlug: slug,
          state: { status: "error", message },
        });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) return { status: "idle" };
  if (!fetched || fetched.forSlug !== slug) return { status: "loading" };
  return fetched.state;
}
