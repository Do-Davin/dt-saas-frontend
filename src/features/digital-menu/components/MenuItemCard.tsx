import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMenuStore } from "../store";
import type { Product } from "../types/digitalMenu.types";

interface MenuItemCardProps {
  item: Product;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const addToCart = useMenuStore((s) => s.addToCart);

  return (
    <Card className="overflow-hidden">
      {item.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-medium leading-snug">{item.name}</h3>
            {item.dietaryTags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
          <p className="mt-2 text-sm font-semibold">${item.price.toFixed(2)}</p>
        </div>
        <Button
          size="icon"
          variant="outline"
          className="shrink-0"
          disabled={!item.isAvailable}
          onClick={() => addToCart(item)}
          aria-label={`Add ${item.name} to cart`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
