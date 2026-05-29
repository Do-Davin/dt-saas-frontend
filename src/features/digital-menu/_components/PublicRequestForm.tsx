import { useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const TEXTAREA_CLASS =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

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
  const [quantity, setQuantity] = useState<number>(1);
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
    if (!Number.isFinite(quantity) || quantity < 1)
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
            quantity: Math.max(1, Math.floor(quantity)),
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

      <Field
        label={t.yourName}
        htmlFor="req-name"
        error={errors.customerName}
      >
        <Input
          id="req-name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          autoComplete="name"
          required
          disabled={isSubmitting}
          aria-invalid={errors.customerName ? true : undefined}
        />
      </Field>

      <Field
        label={t.phoneNumber}
        htmlFor="req-phone"
        error={errors.customerPhone}
      >
        <Input
          id="req-phone"
          type="tel"
          inputMode="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          autoComplete="tel"
          required
          disabled={isSubmitting}
          aria-invalid={errors.customerPhone ? true : undefined}
        />
      </Field>

      <Field label={t.quantity} htmlFor="req-qty" error={errors.quantity}>
        <Input
          id="req-qty"
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={(e) => {
            const n = Number(e.target.value);
            setQuantity(Number.isFinite(n) ? n : 1);
          }}
          disabled={isSubmitting}
          aria-invalid={errors.quantity ? true : undefined}
          className="w-24"
        />
      </Field>

      <Field label={t.itemNote} htmlFor="req-item-note">
        <textarea
          id="req-item-note"
          value={itemNote}
          onChange={(e) => setItemNote(e.target.value)}
          rows={2}
          disabled={isSubmitting}
          className={cn(TEXTAREA_CLASS)}
        />
      </Field>

      <Field label={t.noteToBusiness} htmlFor="req-note">
        <textarea
          id="req-note"
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
          rows={3}
          disabled={isSubmitting}
          className={cn(TEXTAREA_CLASS)}
        />
      </Field>

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

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
