import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { ChevronLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Enter transition wrapper ─────────────────────────────────────────────────
//
// Wraps CRUD form page content with a slide-in-from-right enter animation.
// Exit (back navigation) is instant — a true bidirectional exit animation
// requires keeping both pages mounted simultaneously, which requires a
// library. The enter transition alone removes the "instant pop" feel without
// overengineering.
//
// Reduced-motion: when prefers-reduced-motion is set, children are returned
// as-is with no wrapper <div> and no animation.

function checkReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

interface OwnerCrudTransitionProps {
  children: ReactNode;
}

export function OwnerCrudTransition({ children }: OwnerCrudTransitionProps) {
  const [reducedMotion] = useState(checkReducedMotion);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fire on the next animation frame so the browser has painted the initial
    // (invisible) state before we trigger the transition to the final state.
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(20px)",
        // Transition is always present; the browser animates FROM the initial
        // painted state TO the visible state when visible flips to true.
        transition: "opacity 220ms ease-out, transform 220ms ease-out",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}

// ─── Back button ──────────────────────────────────────────────────────────────
//
// Renders at the top-left of CRUD form pages. Navigates to the parent list
// route with replace so the form page is removed from the history stack.
// Always navigates to the explicit `to` route rather than `navigate(-1)` so
// users who deep-link directly to a form URL still land on the correct list.

interface CrudBackButtonProps {
  to: string;
  label?: string;
}

export function CrudBackButton({ to, label = "Back" }: CrudBackButtonProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to, { replace: true })}
      className={cn(
        "-ml-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5",
        "text-sm text-muted-foreground hover:text-foreground",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <ChevronLeftIcon className="size-3.5 shrink-0" />
      {label}
    </button>
  );
}
