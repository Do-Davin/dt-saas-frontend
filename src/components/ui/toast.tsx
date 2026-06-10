import * as React from "react";
import { create } from "zustand";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "success", message, title, duration }),
  warning: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "warning", message, title, duration }),
  error: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "error", message, title, duration }),
};

function ToastCard({ toast: item }: { toast: ToastItem }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [isExiting, setIsExiting] = React.useState(false);
  const duration = item.duration ?? 4000;
  const progressRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (progressRef.current) {
      // Force a layout calculation to ensure transitions work
      progressRef.current.style.width = "100%";
      progressRef.current.offsetHeight; // force reflow
      progressRef.current.style.transition = `width ${duration}ms linear`;
      progressRef.current.style.width = "0%";
    }

    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    return () => clearTimeout(dismissTimer);
  }, [duration]);

  React.useEffect(() => {
    if (isExiting) {
      const animationTimer = setTimeout(() => {
        removeToast(item.id);
      }, 200); // matches slide-out animation duration
      return () => clearTimeout(animationTimer);
    }
  }, [isExiting, item.id, removeToast]);

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />,
      borderColor: "border-emerald-500/20 dark:border-emerald-500/30",
      bgColor: "bg-emerald-50/90 dark:bg-emerald-950/20",
      progressBg: "bg-emerald-500",
      textColor: "text-emerald-800 dark:text-emerald-200",
      titleColor: "text-emerald-900 dark:text-emerald-100",
      defaultTitle: "Success",
    },
    warning: {
      icon: <AlertTriangle className="size-5 text-amber-500 shrink-0" />,
      borderColor: "border-amber-500/20 dark:border-amber-500/30",
      bgColor: "bg-amber-50/90 dark:bg-amber-950/20",
      progressBg: "bg-amber-500",
      textColor: "text-amber-800 dark:text-amber-200",
      titleColor: "text-amber-900 dark:text-amber-100",
      defaultTitle: "Warning",
    },
    error: {
      icon: <XCircle className="size-5 text-rose-500 shrink-0" />,
      borderColor: "border-rose-500/20 dark:border-rose-500/30",
      bgColor: "bg-rose-50/90 dark:bg-rose-950/20",
      progressBg: "bg-rose-500",
      textColor: "text-rose-800 dark:text-rose-200",
      titleColor: "text-rose-900 dark:text-rose-100",
      defaultTitle: "Error",
    },
  };

  const config = typeConfig[item.type];

  return (
    <div
      role="alert"
      className={cn(
        "relative w-full max-w-sm rounded-xl border bg-white/95 dark:bg-zinc-900/95 shadow-lg overflow-hidden backdrop-blur-md pointer-events-auto transition-all duration-300",
        config.borderColor,
        isExiting ? "animate-toast-out" : "animate-toast-in"
      )}
    >
      <div className={cn("p-4 flex gap-3 items-start", config.bgColor)}>
        {config.icon}
        <div className="flex-1 min-w-0">
          <h4 className={cn("text-sm font-bold tracking-tight mb-0.5", config.titleColor)}>
            {item.title || config.defaultTitle}
          </h4>
          <p className={cn("text-xs font-semibold leading-relaxed", config.textColor)}>
            {item.message}
          </p>
        </div>
        <button
          onClick={() => setIsExiting(true)}
          className="p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          aria-label="Close notification"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-muted/20">
        <div
          ref={progressRef}
          className={cn("h-full w-full rounded-r-full", config.progressBg)}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0"
      aria-live="assertive"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  );
}
