import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMenuStore } from "../store";
import { useLanguageStore } from "../store/languageStore";
import { tText } from "../utils/tText";
import { uiLabels } from "../utils/uiLabels";

export function CartDrawer() {
  const cart = useMenuStore((s) => s.cart);
  const isCartOpen = useMenuStore((s) => s.isCartOpen);
  const toggleCart = useMenuStore((s) => s.toggleCart);
  const updateQuantity = useMenuStore((s) => s.updateQuantity);
  const removeFromCart = useMenuStore((s) => s.removeFromCart);
  const clearCart = useMenuStore((s) => s.clearCart);
  const total = useMenuStore((s) => s.cartTotal());
  const count = useMenuStore((s) => s.cartCount());
  const language = useLanguageStore((s) => s.language);
  const t = uiLabels[language];

  return (
    <Sheet open={isCartOpen} onOpenChange={toggleCart}>
      <SheetContent className="flex flex-col overflow-hidden p-0">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <SheetHeader className="flex-row items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base">{t.cartTitle}</SheetTitle>
            {count > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground tabular-nums">
                {count}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
              onClick={clearCart}
            >
              {t.cartClearAll}
            </Button>
          )}
        </SheetHeader>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="font-medium">{t.cartEmpty}</p>
            <p className="text-sm text-muted-foreground">{t.cartEmptyHint}</p>
          </div>
        ) : (
          <>
            <ScrollArea className="min-h-0 flex-1">
              <ul className="divide-y px-5">
                {cart.map(({ item, quantity }) => (
                  <li key={item.id} className="flex items-center gap-3 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium leading-snug">
                        {tText(item.name, language)}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
                        ${item.price.toFixed(2)} × {quantity}
                        {quantity > 1 && (
                          <span className="ml-1 font-medium text-foreground">
                            = ${(item.price * quantity).toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-full transition-transform active:scale-90"
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                        aria-label={`Decrease ${tText(item.name, language)} quantity`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>

                      <span className="w-7 text-center text-sm font-semibold tabular-nums">
                        {quantity}
                      </span>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-full transition-transform active:scale-90"
                        onClick={() => updateQuantity(item.id, quantity + 1)}
                        aria-label={`Increase ${tText(item.name, language)} quantity`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-9 w-9 shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-90"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${tText(item.name, language)}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <SheetFooter className="flex-col gap-3 border-t px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {count} {count === 1 ? t.cartItem : t.cartItems}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">{t.cartTotal}</span>
                  <span className="text-lg font-bold tabular-nums">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button className="h-12 w-full text-base font-semibold">
                {t.cartPlaceOrder}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
