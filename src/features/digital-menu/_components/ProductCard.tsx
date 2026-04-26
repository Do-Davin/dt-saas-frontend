import { Plus, UtensilsCrossed } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMenuStore } from "../_store";
import { useDigitalMenuUIStore } from "../_store/uiStore";
import { useLanguageStore } from "../_store/languageStore";
import { tText } from "../_utils/tText";
import { uiLabels } from "../_utils/uiLabels";
import type { Product } from "../_types/digitalMenu.types";

interface ProductCardProps {
  product: Product;
}

const DIETARY_TAG_LABELS: Record<string, string> = {
  vegetarian: "Veg",
  vegan: "Vegan",
  "gluten-free": "GF",
  "dairy-free": "DF",
  halal: "Halal",
  kosher: "Kosher",
  spicy: "Spicy",
};

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useMenuStore((s) => s.addToCart);
  const openProductModal = useDigitalMenuUIStore((s) => s.openProductModal);
  const language = useLanguageStore((s) => s.language);
  const t = uiLabels[language];

  return (
    <Card
      className="overflow-hidden gap-0 py-0 cursor-pointer"
      onClick={() => openProductModal(product)}
    >
      {product.imageUrl ? (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={tText(product.name, language)}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-muted">
          <UtensilsCrossed className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
        </div>
      )}

      <CardHeader className="px-4 pt-4 pb-1">
        <CardTitle className="text-base leading-snug">
          {tText(product.name, language)}
        </CardTitle>

        {product.description && (
          <CardDescription className="line-clamp-2">
            {tText(product.description, language)}
          </CardDescription>
        )}

        <CardAction>
          <Button
            size="icon"
            variant={product.isAvailable ? "default" : "outline"}
            className="h-8 w-8 shrink-0"
            disabled={!product.isAvailable}
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            aria-label={`Add ${tText(product.name, language)} to cart`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">
            ${product.price.toFixed(2)}
          </span>

          {!product.isAvailable && (
            <Badge variant="destructive" className="text-xs">
              {t.soldOut}
            </Badge>
          )}

          {product.dietaryTags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {DIETARY_TAG_LABELS[tag] ?? tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
