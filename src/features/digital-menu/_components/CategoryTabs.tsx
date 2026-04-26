import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useMenuStore } from "../_store";
import { useDigitalMenuUIStore } from "../_store/uiStore";
import { useLanguageStore } from "../_store/languageStore";
import { tText } from "../_utils/tText";
import { uiLabels } from "../_utils/uiLabels";

export function CategoryTabs() {
  const categories = useMenuStore((s) => s.categories);
  const selectedCategoryId = useDigitalMenuUIStore((s) => s.selectedCategoryId);
  const selectCategory = useDigitalMenuUIStore((s) => s.selectCategory);
  const language = useLanguageStore((s) => s.language);
  const t = uiLabels[language];

  return (
    <ScrollArea className="pt-1">
      <div className="mx-auto flex max-w-3xl gap-1 px-4 py-2">
        <Button
          variant={selectedCategoryId === null ? "default" : "ghost"}
          className="shrink-0 rounded-full px-4 py-2 text-sm min-h-[44px]"
          onClick={() => selectCategory(null)}
          aria-pressed={selectedCategoryId === null}
        >
          {t.allCategories}
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategoryId === cat.id ? "default" : "ghost"}
            className="shrink-0 rounded-full px-4 py-2 text-sm min-h-[44px]"
            onClick={() => selectCategory(cat.id)}
            aria-pressed={selectedCategoryId === cat.id}
          >
            {tText(cat.name, language)}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
