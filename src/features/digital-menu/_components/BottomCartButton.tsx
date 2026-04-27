import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMenuStore } from "../_store";

export function BottomCartButton() {
  const count = useMenuStore((s) => s.cartCount());
  const toggleCart = useMenuStore((s) => s.toggleCart);

  return (
    <div className="fixed inset-x-0 bottom-0 h-12 z-40 pointer-events-none flex justify-center">
      {/* Background Bar: Left Side (Height extended to cover bottom gaps) */}
      <div className="absolute top-0 left-0 right-[calc(50%+69px)] h-[100px] bg-white border-t border-gray-200 pointer-events-auto" />
      
      {/* Right Side */}
      <div className="absolute top-0 right-0 left-[calc(50%+69px)] h-[100px] bg-white border-t border-gray-200 pointer-events-auto" />

      {/* Center Cutout Curve */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] h-[100px] pointer-events-auto flex flex-col">
        <svg
          width="140"
          height="40"
          viewBox="0 0 140 40"
          className="w-full shrink-0 text-white"
        >
          {/* 1. Fill Path: Completely white fill with NO stroke */}
          <path
            d="M0,0.5 C35,0.5 45,39.5 70,39.5 C95,39.5 105,0.5 140,0.5 L140,40 L0,40 Z"
            fill="currentColor"
          />
          {/* 2. Stroke Path: Draws the gray top border ONLY, removing the vertical side lines */}
          <path
            d="M0,0.5 C35,0.5 45,39.5 70,39.5 C95,39.5 105,0.5 140,0.5"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </svg>
        {/* Fill to eliminate any gap below the curve */}
        <div className="w-full flex-grow bg-white -mt-[1px]" />
      </div>

      {/* Floating Cart Button */}
      <div className="relative pointer-events-auto -top-6">
        <div className="relative inline-block">
          <Button
            onClick={toggleCart}
            variant="default"
            size="icon-lg"
            className="h-14 w-14 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.15)] flex items-center justify-center transition-transform active:scale-95"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>

          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-[22px] min-w-[22px] px-1.5 flex items-center justify-center text-[11px] font-bold rounded-full border-2 border-white shadow-sm"
            >
              {count}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}