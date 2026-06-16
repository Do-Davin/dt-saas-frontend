import { useState, useId } from "react";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createCatalogRequest } from "../_api/requests";
import { useLanguageStore } from "../_store/languageStore";
import { uiLabels } from "../_utils/uiLabels";

interface PublicRequestFormProps {
  businessSlug: string;
  productId: string;
  productName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  quantity?: string;
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "success" };

export function PublicRequestForm({
  businessSlug,
  productId,
  productName,
  onSuccess,
  onCancel,
}: PublicRequestFormProps) {
  const language = useLanguageStore((s) => s.language);
  const t = uiLabels[language];

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [itemNote, setItemNote] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });

  const isSubmitting = submit.status === "submitting";

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!customerName.trim()) next.customerName = t.validationNameRequired;
    if (!customerPhone.trim())
      next.customerPhone = t.validationPhoneRequired;
    const q = Number(quantity);
    if (quantity === "" || !Number.isFinite(q) || q < 1)
      next.quantity = t.validationQuantityMin;
    return next;
  }

  async function submitRequest(): Promise<void> {
    if (isSubmitting) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSubmit({ status: "submitting" });
    try {
      await createCatalogRequest(businessSlug, {
        type: "ORDER",
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerNote: customerNote.trim() ? customerNote.trim() : undefined,
        items: [
          {
            productId,
            quantity: Math.max(1, Math.floor(Number(quantity))),
            note: itemNote.trim() ? itemNote.trim() : undefined,
          },
        ],
      });
      setSubmit({ status: "success" });
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : t.genericRequestError;
      setSubmit({ status: "error", message });
    }
  }

  if (submit.status === "success") {
    return (
      <div className="space-y-4 py-4 text-center">
        <p className="text-base font-semibold">{t.requestSentSuccessfully}</p>
        <p className="text-sm text-muted-foreground">
          {t.requestSuccessDescription}
        </p>
        {onCancel ? (
          <Button variant="outline" onClick={onCancel}>
            {t.close}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitRequest();
      }}
      className="space-y-4"
      noValidate
    >
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {t.cartItem}
        </div>
        <div className="text-sm font-medium">{productName}</div>
      </div>

      <FloatingField
        label={t.yourName}
        value={customerName}
        onChange={setCustomerName}
        required
        disabled={isSubmitting}
        error={errors.customerName}
      />

      <FloatingField
        label={t.phoneNumber}
        type="tel"
        value={customerPhone}
        onChange={setCustomerPhone}
        required
        disabled={isSubmitting}
        error={errors.customerPhone}
      />

      <FloatingField
        label={t.quantity}
        type="number"
        min={1}
        step={1}
        value={quantity}
        onChange={(v) => {
          if (v === "") {
            setQuantity("");
            return;
          }
          const n = Number(v);
          setQuantity(Number.isFinite(n) ? n : "");
        }}
        disabled={isSubmitting}
        error={errors.quantity}
        className="w-32"
      />

      <FloatingField
        label={t.itemNote}
        value={itemNote}
        onChange={setItemNote}
        multiline
        disabled={isSubmitting}
      />

      <FloatingField
        label={t.noteToBusiness}
        value={customerNote}
        onChange={setCustomerNote}
        multiline
        disabled={isSubmitting}
      />

      {submit.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {submit.message}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? t.sending : t.sendRequest}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t.cancel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function FloatingField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  error,
  multiline = false,
  min,
  step,
  className,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  multiline?: boolean;
  min?: number;
  step?: number;
  className?: string;
}) {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);
  const isFloated = isFocused || String(value).length > 0;

  const baseClasses = cn(
    "w-full rounded-xl border bg-card text-sm font-semibold text-foreground outline-none transition-all duration-150 px-3",
    multiline ? "py-4 min-h-[100px] resize-y" : "h-14",
    error
      ? "border-destructive ring-1 ring-destructive/20"
      : isFocused
        ? "border-primary ring-1 ring-primary/20"
        : "border-input hover:border-primary/40",
    className
  );

  return (
    <div className={cn(disabled && "pointer-events-none opacity-60")}>
      <div className="relative">
        {multiline ? (
          <textarea
            id={id}
            value={value}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => onChange(e.target.value)}
            className={baseClasses}
          />
        ) : (
          <input
            id={id}
            type={type}
            min={min}
            step={step}
            value={value}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => onChange(e.target.value)}
            className={baseClasses}
          />
        )}

        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute select-none transition-all duration-150 left-3",
            isFloated
              ? "top-0 -translate-y-1/2 bg-card px-1 text-[11px] font-semibold"
              : cn("text-sm font-normal", multiline ? "top-4" : "top-1/2 -translate-y-1/2"),
            error
              ? "text-destructive"
              : isFocused
                ? "text-primary"
                : "text-muted-foreground"
          )}
        >
          {label}
          {required ? (
            <span aria-hidden className="ml-0.5 text-destructive">
              *
            </span>
          ) : null}
        </label>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}