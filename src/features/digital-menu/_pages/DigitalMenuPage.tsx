import { useEffect, useRef, useLayoutEffect, useState } from "react";
import { useParams, Navigate } from "react-router";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMenuStore } from "../_store";
import { useDigitalMenuUIStore } from "../_store/uiStore";
import { useLanguageStore } from "../_store/languageStore";
import { uiLabels } from "../_utils/uiLabels";
import { useCatalog } from "../_hooks/useCatalog";
import { MenuHeader } from "../_components/MenuHeader";
import { BusinessHeroCarousel } from "../_components/BusinessHeroCarousel";
import { CategoryTabs } from "../_components/CategoryTabs";
import { ProductGrid } from "../_components/ProductGrid";
import { CartDrawer } from "../_components/CartDrawer";
import { BottomCartButton } from "../_components/BottomCartButton";
import { ProductDetailModal } from "../_components/ProductDetailModal";

export function DigitalMenuPage() {
  const { businessSlug = "" } = useParams<{ businessSlug: string }>();
  const catalog = useCatalog(businessSlug);

  const setMenuData = useMenuStore((s) => s.setMenuData);
  const setLoading = useMenuStore((s) => s.setLoading);
  const storeProducts = useMenuStore((s) => s.items);

  const selectedCategoryId = useDigitalMenuUIStore((s) => s.selectedCategoryId);
  const selectCategory = useDigitalMenuUIStore((s) => s.selectCategory);
  const searchQuery = useDigitalMenuUIStore((s) => s.searchQuery);
  const setSearchQuery = useDigitalMenuUIStore((s) => s.setSearchQuery);
  const clearSearch = useDigitalMenuUIStore((s) => s.clearSearch);

  const language = useLanguageStore((s) => s.language);
  const t = uiLabels[language];

  const headerRef = useRef<HTMLElement | null>(null);
  const [topOffset, setTopOffset] = useState(0);

  useLayoutEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const ro = new ResizeObserver(([entry]) => {
      setTopOffset(entry.contentRect.height);
    });
    ro.observe(headerEl);

    return () => ro.disconnect();
  }, []);

  // Mirror the loading flag for any consumers that read it from the store.
  useEffect(() => {
    setLoading(
      catalog.status === "loading" || catalog.status === "idle"
    );
  }, [catalog.status, setLoading]);

  // Sync resolved catalog data into the menu store and reset per-slug UI
  // (category selection / search). `readyData` is the stable state object
  // held inside useCatalog when ready, so this effect only fires on real
  // transitions — not on every render while loading.
  const readyData = catalog.status === "ready" ? catalog : null;
  useEffect(() => {
    if (!readyData) return;
    setMenuData(readyData.categories, readyData.products);
    selectCategory(null);
    clearSearch();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [readyData, setMenuData, selectCategory, clearSearch]);

  if (catalog.status === "notFound") {
    return <Navigate to="/not-found" replace />;
  }

  if (catalog.status === "idle" || catalog.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading menu…
      </div>
    );
  }

  if (catalog.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm text-center">
          <h2 className="text-base font-semibold">Could not load menu</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {catalog.message}
          </p>
        </div>
      </div>
    );
  }

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const visibleProducts = storeProducts
    .filter((p) => !selectedCategoryId || p.categoryId === selectedCategoryId)
    .filter((p) => {
      if (!trimmedQuery) return true;
      // Search both languages so results survive a language switch mid-query.
      const nameHit =
        p.name.en.toLowerCase().includes(trimmedQuery) ||
        (p.name.kh ?? "").toLowerCase().includes(trimmedQuery);
      const descHit = p.description
        ? p.description.en.toLowerCase().includes(trimmedQuery) ||
          (p.description.kh ?? "").toLowerCase().includes(trimmedQuery)
        : false;
      return nameHit || descHit;
    });

  const emptyMessage = trimmedQuery
    ? t.noSearchResults(searchQuery.trim())
    : t.noCategoryItems;

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader
        ref={headerRef}
        restaurantName={catalog.business.name}
        businessType={catalog.business.businessType}
      />

      <div className="mx-auto max-w-3xl px-4 py-4">
        <BusinessHeroCarousel business={catalog.business} />
      </div>

      <div
        className="sticky z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
        style={{ top: `${topOffset}px` }}
      >
        <div className="mx-auto max-w-3xl px-4 pt-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
              aria-label={t.searchPlaceholder}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <CategoryTabs />
      </div>

      <main className="mx-auto max-w-3xl px-4 pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <ProductGrid products={visibleProducts} emptyMessage={emptyMessage} />
      </main>

      <CartDrawer />
      <ProductDetailModal businessSlug={businessSlug} />
      <BottomCartButton />
    </div>
  );
}
