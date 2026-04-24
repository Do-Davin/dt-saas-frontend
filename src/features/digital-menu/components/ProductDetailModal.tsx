import { Plus, Send, UtensilsCrossed, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMenuStore } from "../store";
import { useDigitalMenuUIStore } from "../store/uiStore";

interface ProductDetailModalProps {
  /** Telegram username without @ — passed from the business so the modal stays decoupled from the data store. */
  telegramHandle?: string;
}

const DIETARY_TAG_LABELS: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-free",
  "dairy-free": "Dairy-free",
  halal: "Halal",
  kosher: "Kosher",
  spicy: "Spicy",
};

export function ProductDetailModal({ telegramHandle }: ProductDetailModalProps) {
  const addToCart = useMenuStore((s) => s.addToCart);

  const product = useDigitalMenuUIStore((s) => s.selectedProduct);
  const isOpen = useDigitalMenuUIStore((s) => s.isProductModalOpen);
  const close = useDigitalMenuUIStore((s) => s.closeProductModal);

  if (!product) return null;

  const telegramUrl = telegramHandle
    ? `https://t.me/${telegramHandle}?text=${encodeURIComponent(
        `Hi! I'd like to ask about: ${product.name}`
      )}`
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      {/*
        flex flex-col + max-h keeps the modal within the viewport on every screen.
        gap-0 overrides the default grid gap-4 so image, body, and footer are flush.
        overflow-hidden ensures the image doesn't escape the rounded corners.
        100svh (small viewport) accounts for mobile browser chrome (URL bar, nav).
      */}
      <DialogContent
        className="flex flex-col gap-0 overflow-hidden p-0 max-h-[calc(100svh-2rem)] sm:max-w-xl"
        showCloseButton={false}
      >
        {/* Close button — own version so we can give it a contrast backdrop
            over images that may be dark or light                              */}
        <button
          onClick={close}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image — shrink-0 keeps it from being squashed when body is short */}
        <div className="shrink-0">
          {product.imageUrl ? (
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-muted">
              <UtensilsCrossed
                className="h-10 w-10 text-muted-foreground/40"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Scrollable body — min-h-0 is required for flex children to
            actually scroll rather than expand the container              */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pt-4 pb-2">
          {/* Name + price */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <DialogTitle className="text-lg leading-snug">
              {product.name}
            </DialogTitle>
            <span className="text-base font-semibold">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Availability + dietary tags */}
          {((!product.isAvailable) || (product.dietaryTags && product.dietaryTags.length > 0)) && (
            <div className="flex flex-wrap gap-1.5">
              {!product.isAvailable && (
                <Badge variant="destructive">Sold Out</Badge>
              )}
              {product.dietaryTags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {DIETARY_TAG_LABELS[tag] ?? tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Full description — no line-clamp */}
          {product.description && (
            <DialogDescription
              className="text-sm text-foreground leading-relaxed"
            >
              {product.description}
            </DialogDescription>
          )}

          {/* Allergens */}
          {product.allergens && product.allergens.length > 0 && (
            <p className="text-sm">
              <span className="font-medium">Allergens: </span>
              <span className="capitalize text-muted-foreground">
                {product.allergens.join(", ")}
              </span>
            </p>
          )}

          {/* Calories */}
          {product.calories != null && (
            <p className="text-sm text-muted-foreground">
              {product.calories} kcal
            </p>
          )}
        </div>

        {/* Footer — always visible, never scrolls away */}
        <DialogFooter className="shrink-0 gap-2 border-t px-6 py-4 sm:flex-row">
          {telegramUrl && (
            <Button asChild variant="outline" className="gap-2 sm:flex-1">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Ask on Telegram
              </a>
            </Button>
          )}
          <Button
            className="gap-2 sm:flex-1"
            disabled={!product.isAvailable}
            onClick={() => {
              addToCart(product);
              close();
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
