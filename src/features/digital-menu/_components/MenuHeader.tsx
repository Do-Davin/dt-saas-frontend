import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMenuStore } from "../_store";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface MenuHeaderProps {
  restaurantName: string;
}

export function MenuHeader({ restaurantName }: MenuHeaderProps) {
  const count = useMenuStore((s) => s.cartCount());
  const toggleCart = useMenuStore((s) => s.toggleCart);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">{restaurantName}</h1>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={toggleCart} className="relative">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs">
                {count}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
