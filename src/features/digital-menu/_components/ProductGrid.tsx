import { UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "./ProductCard";
import type { Product } from "../_types/digitalMenu.types";

interface ProductGridProps {
  products: Product[];
  /** Shown in the empty state. Defaults to a generic message. */
  emptyMessage?: string;
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <UtensilsCrossed className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductGrid({
  products,
  emptyMessage = "No items are available in this category right now.",
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
