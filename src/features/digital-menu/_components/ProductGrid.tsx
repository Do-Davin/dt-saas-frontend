import { ProductCard } from "./ProductCard";
import { EmptyProductState } from "./EmptyProductState";
import type { Product } from "../_types/digitalMenu.types";

interface ProductGridProps {
  products: Product[];
  /** Shown in the empty state. Defaults to a generic message. */
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage,
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyProductState message={emptyMessage} />;
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
