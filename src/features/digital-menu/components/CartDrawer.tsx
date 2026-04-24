import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMenuStore } from "../store";

export function CartDrawer() {
  const cart = useMenuStore((s) => s.cart);
  const isCartOpen = useMenuStore((s) => s.isCartOpen);
  const toggleCart = useMenuStore((s) => s.toggleCart);
  const updateQuantity = useMenuStore((s) => s.updateQuantity);
  const removeFromCart = useMenuStore((s) => s.removeFromCart);
  const cartTotal = useMenuStore((s) => s.cartTotal);

  return (
    <Sheet open={isCartOpen} onOpenChange={toggleCart}>
      {/*
        SheetContent (side="right") is already h-full flex flex-col.
        overflow-hidden ensures the ScrollArea flex-1 actually scrolls
        instead of expanding past the sheet height.
      */}
      <SheetContent className="overflow-hidden">
        <SheetHeader>
          <SheetTitle>Your Order</SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          </div>
        ) : (
          <>
            {/*
              min-h-0 is required alongside flex-1 so the browser constrains
              the scroll area to remaining height rather than expanding it.
            */}
            <ScrollArea className="min-h-0 flex-1">
              <ul className="space-y-4 px-4">
                {cart.map(({ item, quantity }) => (
                  <li key={item.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${(item.price * quantity).toFixed(2)}
                        </p>
                      </div>
                      {/* Touch-safe controls — each button is 44×44 area */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, quantity - 1)}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm tabular-nums">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, quantity + 1)}
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </li>
                ))}
              </ul>
            </ScrollArea>

            {/* SheetFooter has mt-auto — sticks to bottom regardless of list length */}
            <SheetFooter className="flex-col gap-3">
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span className="tabular-nums">${cartTotal().toFixed(2)}</span>
              </div>
              <Button className="w-full">Place Order</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
