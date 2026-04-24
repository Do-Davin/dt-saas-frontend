import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useMenuStore } from "../store";
import { useDigitalMenuUIStore } from "../store/uiStore";

export function CategoryTabs() {
  const categories = useMenuStore((s) => s.categories);
  const selectedCategoryId = useDigitalMenuUIStore((s) => s.selectedCategoryId);
  const selectCategory = useDigitalMenuUIStore((s) => s.selectCategory);

  return (
    <ScrollArea className="pt-1">
      <div className="mx-auto flex max-w-3xl gap-1 px-4 py-2">
        {/* min-h-[44px] ensures touch targets meet the 44px mobile minimum
            while keeping the visual pill size controlled by px/py             */}
        <Button
          variant={selectedCategoryId === null ? "default" : "ghost"}
          className="shrink-0 rounded-full px-4 py-2 text-sm min-h-[44px]"
          onClick={() => selectCategory(null)}
          aria-pressed={selectedCategoryId === null}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategoryId === cat.id ? "default" : "ghost"}
            className="shrink-0 rounded-full px-4 py-2 text-sm min-h-[44px]"
            onClick={() => selectCategory(cat.id)}
            aria-pressed={selectedCategoryId === cat.id}
          >
            {cat.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
