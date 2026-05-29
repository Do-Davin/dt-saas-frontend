import { useState } from "react";
import { ArrowLeft, Plus, Send, UtensilsCrossed, X } from "lucide-react";
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
import { useMenuStore } from "../_store";
import { useDigitalMenuUIStore } from "../_store/uiStore";
import { useLanguageStore } from "../_store/languageStore";
import { tText } from "../_utils/tText";
import { uiLabels } from "../_utils/uiLabels";
import { PriceDisplay } from "./PriceDisplay";
import { PublicRequestForm } from "./PublicRequestForm";
import type { Product } from "../_types/digitalMenu.types";

const DIETARY_TAG_LABELS: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-free",
  "dairy-free": "Dairy-free",
  halal: "Halal",
  kosher: "Kosher",
  spicy: "Spicy",
};

interface ProductDetailModalProps {
  businessSlug: string;
}

export function ProductDetailModal({ businessSlug }: ProductDetailModalProps) {
  const product = useDigitalMenuUIStore((s) => s.selectedProduct);
  const isOpen = useDigitalMenuUIStore((s) => s.isProductModalOpen);
  const close = useDigitalMenuUIStore((s) => s.closeProductModal);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        className="flex flex-col gap-0 overflow-hidden p-0 max-h-[calc(100svh-2rem)] sm:max-w-xl"
        showCloseButton={false}
      >
        {/* Keyed by product.id so the inner mode state ("detail" | "request")
            resets automatically when a different product is opened. On modal
            close the store nulls `selectedProduct`, this component returns
            null, and the next opening mounts the body fresh — no effect-based
            state sync required. */}
        <ProductModalBody
          key={product.id}
          product={product}
          businessSlug={businessSlug}
          onClose={close}
        />
      </DialogContent>
    </Dialog>
  );
}

interface ProductModalBodyProps {
  product: Product;
  businessSlug: string;
  onClose: () => void;
}

function ProductModalBody({
  product,
  businessSlug,
  onClose,
}: ProductModalBodyProps) {
  const addToCart = useMenuStore((s) => s.addToCart);
  const language = useLanguageStore((s) => s.language);
  const t = uiLabels[language];

  const [mode, setMode] = useState<"detail" | "request">("detail");

  const productName = tText(product.name, language);
  const hasBadges =
    !product.isAvailable || (product.dietaryTags?.length ?? 0) > 0;

  return (
    <>
      <button
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      {mode === "detail" ? (
        <>
          <div className="shrink-0">
            {product.imageUrl ? (
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={product.imageUrl}
                  alt={productName}
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

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pt-4 pb-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <DialogTitle className="text-lg leading-snug">
                {productName}
              </DialogTitle>
              <PriceDisplay price={product.price} />
            </div>

            {hasBadges && (
              <div className="flex flex-wrap gap-1.5">
                {!product.isAvailable && (
                  <Badge variant="destructive">{t.soldOut}</Badge>
                )}
                {product.dietaryTags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {DIETARY_TAG_LABELS[tag] ?? tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {product.description && (
              <DialogDescription className="text-sm text-foreground leading-relaxed">
                {tText(product.description, language)}
              </DialogDescription>
            )}

            {product.allergens && product.allergens.length > 0 && (
              <p className="text-sm">
                <span className="font-medium">{t.allergens}: </span>
                <span className="capitalize text-muted-foreground">
                  {product.allergens.join(", ")}
                </span>
              </p>
            )}

            {product.calories != null && (
              <p className="text-sm text-muted-foreground">
                {product.calories} kcal
              </p>
            )}
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t px-6 py-4 sm:flex-row">
            <Button
              variant="outline"
              className="gap-2 sm:flex-1"
              disabled={!product.isAvailable}
              onClick={() => setMode("request")}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Send request
            </Button>
            <Button
              className="gap-2 sm:flex-1"
              disabled={!product.isAvailable}
              onClick={() => {
                addToCart(product);
                onClose();
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t.addToOrder}
            </Button>
          </DialogFooter>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pt-6 pb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2"
              onClick={() => setMode("detail")}
              aria-label="Back to item details"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          </div>
          <DialogTitle className="text-lg leading-snug">
            Send request
          </DialogTitle>
          <PublicRequestForm
            businessSlug={businessSlug}
            productId={product.id}
            productName={productName}
            onCancel={onClose}
          />
        </div>
      )}
    </>
  );
}
