import { useState } from "react";
import { useParams } from "react-router";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiError } from "@/lib/api/client";
import { useMenuStore } from "../_store";
import { useLanguageStore } from "../_store/languageStore";
import { tText } from "../_utils/tText";
import { uiLabels } from "../_utils/uiLabels";
import { createCatalogRequest } from "../_api/requests";

type DrawerView = "cart" | "checkout";

type SubmitStatus =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

const TEXTAREA_CLASS =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

export function CartDrawer() {
  const { businessSlug = "" } = useParams<{ businessSlug: string }>();
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

  const [view, setView] = useState<DrawerView>("cart");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ status: "idle" });
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Resets checkout form state and returns to the cart view. Called both
  // from the Back button and from the Sheet's onOpenChange (user-initiated
  // close). Also called manually after a successful submit because Radix
  // does NOT fire onOpenChange for programmatic prop changes.
  function resetForm() {
    setView("cart");
    setSubmitStatus({ status: "idle" });
    setCustomerName("");
    setCustomerPhone("");
    setCustomerNote("");
    setNameError("");
    setPhoneError("");
  }

  // Only fired for user-initiated close events (backdrop click, Escape).
  // Programmatic closes (toggleCart() calls) do NOT trigger this.
  function handleOpenChange(open: boolean) {
    if (!open) resetForm();
    toggleCart();
  }

  async function handleSubmit() {
    const nextNameError = customerName.trim() ? "" : t.validationNameRequired;
    const nextPhoneError = customerPhone.trim() ? "" : t.validationPhoneRequired;
    setNameError(nextNameError);
    setPhoneError(nextPhoneError);
    if (nextNameError || nextPhoneError) return;

    setSubmitStatus({ status: "submitting" });
    try {
      await createCatalogRequest(businessSlug, {
        type: "ORDER",
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerNote: customerNote.trim() || undefined,
        items: cart.map((c) => ({ productId: c.item.id, quantity: c.quantity })),
      });
      resetForm();
      clearCart();
      toggleCart();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t.genericRequestError;
      setSubmitStatus({ status: "error", message });
    }
  }

  const isSubmitting = submitStatus.status === "submitting";

  return (
    <Sheet open={isCartOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col overflow-hidden p-0">
        <SheetHeader className="flex-row items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            {view === "checkout" && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 h-8 w-8 shrink-0"
                onClick={resetForm}
                aria-label={t.back}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <SheetTitle className="text-base">{t.cartTitle}</SheetTitle>
            {view === "cart" && count > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground tabular-nums">
                {count}
              </span>
            )}
          </div>
          {view === "cart" && cart.length > 0 && (
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

        {view === "cart" ? (
          cart.length === 0 ? (
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
                <Button
                  className="h-12 w-full text-base font-semibold"
                  onClick={() => setView("checkout")}
                >
                  {t.cartPlaceOrder}
                </Button>
              </SheetFooter>
            </>
          )
        ) : (
          <>
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-4 px-5 py-4">
                <p className="text-sm text-muted-foreground">
                  {count} {count === 1 ? t.cartItem : t.cartItems} &middot; ${total.toFixed(2)}
                </p>

                <div className="space-y-1">
                  <label htmlFor="co-name" className="block text-sm font-medium">
                    {t.yourName}
                  </label>
                  <Input
                    id="co-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    autoComplete="name"
                    required
                    disabled={isSubmitting}
                    aria-invalid={nameError ? true : undefined}
                  />
                  {nameError && (
                    <p className="text-xs text-destructive" role="alert">
                      {nameError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="co-phone" className="block text-sm font-medium">
                    {t.phoneNumber}
                  </label>
                  <Input
                    id="co-phone"
                    type="tel"
                    inputMode="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    autoComplete="tel"
                    required
                    disabled={isSubmitting}
                    aria-invalid={phoneError ? true : undefined}
                  />
                  {phoneError && (
                    <p className="text-xs text-destructive" role="alert">
                      {phoneError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="co-note" className="block text-sm font-medium">
                    {t.noteToBusiness}
                  </label>
                  <textarea
                    id="co-note"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    rows={3}
                    disabled={isSubmitting}
                    className={TEXTAREA_CLASS}
                  />
                </div>
              </div>
            </ScrollArea>

            <SheetFooter className="flex-col gap-2 border-t px-5 py-4">
              {submitStatus.status === "error" && (
                <p className="text-sm text-destructive" role="alert">
                  {submitStatus.message}
                </p>
              )}
              <Button
                className="h-12 w-full text-base font-semibold"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? t.sending : t.cartPlaceOrder}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
