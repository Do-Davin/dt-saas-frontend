import { useEffect } from "react";
import { useParams, Navigate } from "react-router";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMenuStore } from "../_store";
import { useDigitalMenuUIStore } from "../_store/uiStore";
import { useLanguageStore } from "../_store/languageStore";
// import { tText } from "../_utils/tText";
import { uiLabels } from "../_utils/uiLabels";
import { MenuHeader } from "../_components/MenuHeader";
import { BusinessHeroCarousel } from "../_components/BusinessHeroCarousel";
import { CategoryTabs } from "../_components/CategoryTabs";
import { ProductGrid } from "../_components/ProductGrid";
import { CartDrawer } from "../_components/CartDrawer";
import { BottomCartButton } from "../_components/BottomCartButton";
import { ProductDetailModal } from "../_components/ProductDetailModal";
import {
  mockBusiness,
  mockCategories,
  mockProducts,
} from "../_data/mockMenuData";

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

  useEffect(() => {
    const data = resolveBySlug(businessSlug);
    if (!data) return;
    setLoading(true);
    setMenuData(data.categories, data.products);
    setLoading(false);
    selectCategory(null);
    clearSearch();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [businessSlug, setMenuData, setLoading, selectCategory, clearSearch]);

  const resolved = resolveBySlug(businessSlug);
  if (!resolved) return <Navigate to="/not-found" replace />;

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
      <MenuHeader restaurantName={resolved.business.name} />

      <div className="mx-auto max-w-3xl px-4 py-4">
        <BusinessHeroCarousel business={resolved.business} />
      </div>

      <div className="sticky top-14.25 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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

      <main className="mx-auto max-w-3xl px-4 py-6">
        <ProductGrid products={visibleProducts} emptyMessage={emptyMessage} />
      </main>

      <CartDrawer />
      <ProductDetailModal />
      <BottomCartButton />
    </div>
  );
}
