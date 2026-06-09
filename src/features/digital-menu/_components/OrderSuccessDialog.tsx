import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "../_store/languageStore";
import { uiLabels } from "../_utils/uiLabels";
import { useDigitalMenuUIStore } from "../_store/uiStore";
import "../_pages/OrderSuccess.css";

export function OrderSuccessDialog() {
  const isOpen = useDigitalMenuUIStore((s) => s.isSuccessDialogOpen);
  const close = useDigitalMenuUIStore((s) => s.closeSuccessDialog);
  const language = useLanguageStore((s) => s.language);
  const t = uiLabels[language];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        className="flex flex-col items-center justify-center gap-6 p-8 text-center"
        showCloseButton={false}
      >
        <div className="order-success-icon">
          <svg
            viewBox="0 0 80 80"
            fill="none"
            className="h-24 w-24"
            aria-hidden="true"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              className="order-success-circle"
            />
            <path
              d="M24 42 L35 53 L56 28"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="order-success-check"
            />
          </svg>

          <span className="order-success-dot order-success-dot-1" aria-hidden="true" />
          <span className="order-success-dot order-success-dot-2" aria-hidden="true" />
          <span className="order-success-dot order-success-dot-3" aria-hidden="true" />
          <span className="order-success-dot order-success-dot-4" aria-hidden="true" />
          <span className="order-success-dot order-success-dot-5" aria-hidden="true" />
          <span className="order-success-dot order-success-dot-6" aria-hidden="true" />
        </div>
        <div className="order-success-text">
          <h2 className="text-2xl font-extrabold text-foreground">
            {t.orderSuccessTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-bold">
            {t.orderSuccessDescription}
          </p>
        </div>
        <Button
          className="order-success-btn h-12 w-full text-base font-semibold"
          onClick={close}
        >
          {t.continueShopping}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
