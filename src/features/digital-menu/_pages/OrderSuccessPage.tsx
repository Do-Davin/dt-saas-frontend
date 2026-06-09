import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "../_store/languageStore";
import { uiLabels } from "../_utils/uiLabels";
import "./OrderSuccess.css";

export function OrderSuccessPage() {
  const { businessSlug = "" } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();
  const language = useLanguageStore((s) => s.language);
  const t = uiLabels[language];

  function handleContinue() {
    navigate(`/menu/${encodeURIComponent(businessSlug)}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-6 rounded-2xl border bg-card p-8 shadow-sm">
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
          <h1 className="text-2xl font-bold text-foreground">
            {t.orderSuccessTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t.orderSuccessDescription}
          </p>
        </div>
        <Button
          className="order-success-btn h-12 w-full text-base font-semibold"
          onClick={handleContinue}
        >
          {t.continueShopping}
        </Button>
      </div>
    </div>
  );
}
