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
import { useMenuStore } from "../store";
import { useDigitalMenuUIStore } from "../store/uiStore";
import type { Product } from "../types/digitalMenu.types";

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

  return (
    <Card
      className="overflow-hidden gap-0 py-0 cursor-pointer"
      onClick={() => openProductModal(product)}
    >
      {/* Image */}
      {product.imageUrl ? (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-muted">
          <UtensilsCrossed className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
        </div>
      )}

      {/* Header — name + add button via CardAction */}
      <CardHeader className="px-4 pt-4 pb-1">
        <CardTitle className="text-base leading-snug">
          {product.name}
        </CardTitle>

        {product.description && (
          <CardDescription className="line-clamp-2">
            {product.description}
          </CardDescription>
        )}

        <CardAction>
          <Button
            size="icon"
            variant={product.isAvailable ? "default" : "outline"}
            className="h-8 w-8 shrink-0"
            disabled={!product.isAvailable}
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardAction>
      </CardHeader>

      {/* Footer row — price, tags, availability */}
      <CardContent className="px-4 pb-4 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">
            ${product.price.toFixed(2)}
          </span>

          {!product.isAvailable && (
            <Badge variant="destructive" className="text-xs">
              Sold Out
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
