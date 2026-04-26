import { useEffect } from "react";
import { useParams, Navigate } from "react-router";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMenuStore } from "../store";
import { useDigitalMenuUIStore } from "../store/uiStore";
import { useLanguageStore } from "../store/languageStore";
import { tText } from "../utils/tText";
import { uiLabels } from "../utils/uiLabels";
import { MenuHeader } from "../components/MenuHeader";
import { BusinessHeroCarousel } from "../components/BusinessHeroCarousel";
import { CategoryTabs } from "../components/CategoryTabs";
import { ProductGrid } from "../components/ProductGrid";
import { CartDrawer } from "../components/CartDrawer";
import { BottomCartButton } from "../components/BottomCartButton";
import { ProductDetailModal } from "../components/ProductDetailModal";
import {
  mockBusiness,
  mockCategories,
  mockProducts,
} from "../data/mockMenuData";

function resolveBySlug(slug: string) {
  if (slug !== mockBusiness.slug) return null;
  const categories = mockCategories.filter(
    (c) => c.businessId === mockBusiness.id
  );
  const products = mockProducts.filter((p) =>
    categories.some((c) => c.id === p.categoryId)
  );
  return { business: mockBusiness, categories, products };
}

export function DigitalMenuPage() {
  const { businessSlug = "" } = useParams<{ businessSlug: string }>();

  // ── Data store ────────────────────────────────────────────────────────────
  const setMenuData = useMenuStore((s) => s.setMenuData);
  const setLoading = useMenuStore((s) => s.setLoading);
  const storeProducts = useMenuStore((s) => s.items);

  // ── UI store ──────────────────────────────────────────────────────────────
  const selectedCategoryId = useDigitalMenuUIStore((s) => s.selectedCategoryId);
  const selectCategory = useDigitalMenuUIStore((s) => s.selectCategory);
  const searchQuery = useDigitalMenuUIStore((s) => s.searchQuery);
  const setSearchQuery = useDigitalMenuUIStore((s) => s.setSearchQuery);
  const clearSearch = useDigitalMenuUIStore((s) => s.clearSearch);

  // ── Language ──────────────────────────────────────────────────────────────
  const language = useLanguageStore((s) => s.language);
  const t = uiLabels[language];

  useEffect(() => {
    const resolved = resolveBySlug(businessSlug);
    if (!resolved) return;
    setLoading(true);
    setMenuData(resolved.categories, resolved.products);
    setLoading(false);
    selectCategory(null);
    clearSearch();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [businessSlug, setMenuData, setLoading, selectCategory, clearSearch]);

  const resolved = resolveBySlug(businessSlug);
  if (!resolved) return <Navigate to="/not-found" replace />;

  // ── Filtering ─────────────────────────────────────────────────────────────
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const visibleProducts = storeProducts
    .filter((p) => !selectedCategoryId || p.categoryId === selectedCategoryId)
    .filter((p) => {
      if (!trimmedQuery) return true;
      // Search across both languages so switching language doesn't break results.
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
      {/* Sticky nav — business name (brand, not translated) + lang switcher + cart */}
      <MenuHeader restaurantName={resolved.business.name} />

      {/* Hero carousel */}
      <div className="mx-auto max-w-3xl px-4 py-4">
        <BusinessHeroCarousel business={resolved.business} />
      </div>

      {/* Search + category filter */}
      <div className="sticky top-[57px] z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-3xl px-4 pt-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
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

      {/* Product grid */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        <ProductGrid products={visibleProducts} emptyMessage={emptyMessage} />
      </main>

      {/* Overlays */}
      <CartDrawer />
      <ProductDetailModal />
      <BottomCartButton />
    </div>
  );
}
