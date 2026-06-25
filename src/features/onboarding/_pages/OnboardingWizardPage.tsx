import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  XIcon,
  PlusIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import { useOwnerAuthStore } from '@/features/owner/_store/ownerAuth';
import { useOwnerSessionStore } from '@/features/owner/_store/ownerSession';
import { useOwnerBusinessesStore } from '@/features/owner/_store/ownerBusinesses';
import { useOnboardingStore } from '../_store/onboardingStore';
import { submitOnboarding } from '../_api/onboarding';
import {
  BUSINESS_TYPES,
  BUSINESS_TYPE_TEMPLATES,
  PLANS,
  ADDON_ITEM_PRICE,
  ADDON_USER_PRICE,
  ADDON_ITEM_PACK_SIZE,
  ADDON_USER_PACK_SIZE,
} from '../_types/onboarding.types';

const TOTAL_STEPS = 7;

const STEP_TITLES = [
  'Business Info',
  'Business Type',
  'Menu Template',
  'Terms of Service',
  'Account Details',
  'Verify Phone',
  'Payment',
];

// ─── Fake QR placeholder ──────────────────────────────────────────────────────

function FakeQrCode() {
  return (
    <div className="mx-auto w-44 h-44 bg-white border-2 border-gray-800 p-2 rounded-lg shadow-sm">
      <div
        className="w-full h-full rounded-sm"
        style={{
          backgroundImage:
            'repeating-conic-gradient(#1a1a2e 0deg 90deg, #ffffff 90deg 180deg)',
          backgroundSize: '8px 8px',
        }}
      />
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function StepBusinessInfo() {
  const { businessName, businessNameKm, setBusinessName, setBusinessNameKm } =
    useOnboardingStore();
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Business Name (English){' '}
          <span className="text-destructive">*</span>
        </label>
        <Input
          type="text"
          placeholder="e.g. DT Kitchen"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Business Name (Khmer){' '}
          <span className="text-xs font-normal text-muted-foreground">optional</span>
        </label>
        <Input
          type="text"
          placeholder="e.g. ផ្ទះបាយ DT"
          value={businessNameKm}
          onChange={(e) => setBusinessNameKm(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function StepBusinessType() {
  const { businessType, setBusinessType } = useOnboardingStore();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {BUSINESS_TYPES.map((bt) => {
        const selected = businessType === bt.id;
        return (
          <button
            key={bt.id}
            type="button"
            onClick={() => setBusinessType(bt.id)}
            className={cn(
              'relative rounded-xl border p-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:border-primary/40 hover:bg-accent/20',
            )}
          >
            {selected && (
              <span className="absolute right-2 top-2">
                <CheckIcon className="size-3.5 text-primary" />
              </span>
            )}
            <span className="text-xl leading-none">{bt.emoji}</span>
            <p className="mt-1.5 text-xs font-medium text-foreground leading-tight">
              {bt.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function StepMenuTemplate() {
  const { businessType, customCategories, addCustomCategory, removeCustomCategory } =
    useOnboardingStore();
  const [newCatName, setNewCatName] = useState('');

  const templates = businessType ? BUSINESS_TYPE_TEMPLATES[businessType] : [];

  function handleAdd() {
    const trimmed = newCatName.trim();
    if (trimmed && !customCategories.includes(trimmed)) {
      addCustomCategory(trimmed);
      setNewCatName('');
    }
  }

  return (
    <div className="space-y-5">
      {templates.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Template preview
          </p>
          <div className="space-y-1.5">
            {templates.map((cat) => (
              <div
                key={cat.name}
                className="rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <p className="text-sm font-medium text-foreground">{cat.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cat.products.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Custom categories
        </p>
        {customCategories.length > 0 && (
          <div className="space-y-1.5 mb-2.5">
            {customCategories.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
              >
                <span className="text-sm text-foreground">{cat}</span>
                <button
                  type="button"
                  onClick={() => removeCustomCategory(cat)}
                  className="ml-2 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${cat}`}
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a custom category…"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!newCatName.trim()}
            className="shrink-0 h-10 w-10 p-0"
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

function StepAgreement() {
  const { agreedToTerms, setAgreedToTerms } = useOnboardingStore();
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/40 p-4 max-h-52 overflow-y-auto text-xs text-muted-foreground space-y-2.5 leading-relaxed">
        <p className="font-semibold text-foreground text-sm">Terms of Service</p>
        <p>
          By registering on DT SaaS, you agree to operate your digital storefront in
          accordance with our platform policies. You are responsible for the accuracy of
          your business information and catalog content.
        </p>
        <p>
          DT SaaS provides a platform for creating digital menus and managing business
          operations. We reserve the right to suspend accounts that violate our community
          guidelines or terms of acceptable use.
        </p>
        <p>
          Your subscription renews automatically at the end of each billing period unless
          cancelled before the renewal date. Refunds are processed within 7 business days of
          a valid cancellation request.
        </p>
        <p>
          By using DT SaaS you consent to receive service-related communications at the
          contact information provided during registration.
        </p>
      </div>
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-primary shrink-0"
        />
        <span className="text-sm text-foreground leading-snug">
          I have read and agree to the Terms of Service
        </span>
      </label>
    </div>
  );
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────

type AccountField = 'fullName' | 'username' | 'password' | 'confirmPassword' | 'phoneNumber';

function StepAccountDetails({ errors }: { errors: Partial<Record<AccountField, string>> }) {
  const store = useOnboardingStore();
  const values: Record<AccountField, string> = {
    fullName: store.fullName,
    username: store.username,
    password: store.password,
    confirmPassword: store.confirmPassword,
    phoneNumber: store.phoneNumber,
  };

  const fields: { key: AccountField; label: string; type: string; placeholder: string }[] = [
    { key: 'fullName',        label: 'Full Name',        type: 'text',     placeholder: 'e.g. Davin Do' },
    { key: 'username',        label: 'Username',         type: 'text',     placeholder: 'e.g. davin_do' },
    { key: 'password',        label: 'Password',         type: 'password', placeholder: '••••••••' },
    { key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
    { key: 'phoneNumber',     label: 'Phone Number',     type: 'tel',      placeholder: '+855 xx xxx xxxx' },
  ];

  return (
    <div className="space-y-4">
      {fields.map(({ key, label, type, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            {label} <span className="text-destructive">*</span>
          </label>
          <Input
            type={type}
            placeholder={placeholder}
            value={values[key]}
            onChange={(e) => store.setField(key, e.target.value)}
            className={errors[key] ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors[key] && (
            <p className="text-xs text-destructive">{errors[key]}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 6 ───────────────────────────────────────────────────────────────────

function StepOtp({
  otpValue,
  otpError,
  otpResent,
  onOtpChange,
  onResend,
}: {
  otpValue: string;
  otpError: string;
  otpResent: boolean;
  onOtpChange: (v: string) => void;
  onResend: () => void;
}) {
  const { phoneNumber } = useOnboardingStore();
  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-muted px-4 py-3 text-sm">
        <p className="text-muted-foreground">
          A 6-digit code was sent to{' '}
          <span className="font-semibold text-foreground">
            {phoneNumber || 'your phone number'}
          </span>
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Enter 6-digit code</label>
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          value={otpValue}
          onChange={(e) =>
            onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))
          }
          className={cn(
            'text-center text-xl tracking-[0.4em] font-mono',
            otpError ? 'border-destructive focus-visible:ring-destructive' : '',
          )}
        />
        {otpError && <p className="text-xs text-destructive">{otpError}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onResend}
          className="text-sm text-primary hover:underline underline-offset-2"
        >
          Resend code
        </button>
        {otpResent && (
          <span className="text-xs text-muted-foreground">Code resent!</span>
        )}
      </div>

      <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
        Demo hint: enter{' '}
        <code className="font-mono bg-background px-1 py-0.5 rounded border border-border">
          123456
        </code>{' '}
        to continue.
      </div>
    </div>
  );
}

// ─── Step 7 ───────────────────────────────────────────────────────────────────

function StepPayment() {
  const { selectedPlan, extraItemPacks, extraUserPacks } = useOnboardingStore();
  const plan = PLANS.find((p) => p.id === selectedPlan);
  const base = plan?.monthlyPrice ?? 0;
  const total = base + extraItemPacks * ADDON_ITEM_PRICE + extraUserPacks * ADDON_USER_PRICE;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4 text-sm space-y-2">
        {plan && (
          <div className="flex justify-between text-muted-foreground">
            <span>{plan.name} plan</span>
            <span>${base.toFixed(2)}/mo</span>
          </div>
        )}
        {extraItemPacks > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>+{extraItemPacks * ADDON_ITEM_PACK_SIZE} items</span>
            <span>${(extraItemPacks * ADDON_ITEM_PRICE).toFixed(2)}/mo</span>
          </div>
        )}
        {extraUserPacks > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>+{extraUserPacks * ADDON_USER_PACK_SIZE} users</span>
            <span>${(extraUserPacks * ADDON_USER_PRICE).toFixed(2)}/mo</span>
          </div>
        )}
        <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
          <span>Total</span>
          <span>${total.toFixed(2)}/mo</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
          ABA KHQR — Demo Payment
        </p>
        <p className="text-xs text-muted-foreground mb-5">
          Open your ABA app and scan the QR code below
        </p>
        <FakeQrCode />
        <p className="mt-4 text-sm text-muted-foreground">
          Amount:{' '}
          <span className="font-semibold text-foreground">${total.toFixed(2)}</span>
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground italic">
          This is a demo QR — no real payment will be processed.
        </p>
      </div>
    </div>
  );
}

// ─── Main wizard page ─────────────────────────────────────────────────────────

export function OnboardingWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrors, setStepErrors] = useState<Partial<Record<AccountField, string>>>({});
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpResent, setOtpResent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const store = useOnboardingStore();

  function validateStep5(): Partial<Record<AccountField, string>> {
    const errors: Partial<Record<AccountField, string>> = {};
    if (!store.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!store.username.trim()) errors.username = 'Username is required.';
    if (store.password.length < 8)
      errors.password = 'Password must be at least 8 characters.';
    if (store.password !== store.confirmPassword)
      errors.confirmPassword = 'Passwords do not match.';
    if (!store.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required.';
    return errors;
  }

  function isNextDisabled(): boolean {
    if (submitting) return true;
    if (currentStep === 1) return !store.businessName.trim();
    if (currentStep === 2) return store.businessType === null;
    if (currentStep === 4) return !store.agreedToTerms;
    return false;
  }

  function buildPayload() {
    const templates = store.businessType ? BUSINESS_TYPE_TEMPLATES[store.businessType] : [];
    const categories = [
      ...templates.map((cat) => ({ name: cat.name, products: cat.products })),
      ...store.customCategories.map((name) => ({ name, products: [] as string[] })),
    ];
    return {
      plan: store.selectedPlan ?? 'MONTHLY',
      extraItemPacks: store.extraItemPacks,
      extraUserPacks: store.extraUserPacks,
      businessName: store.businessName,
      businessNameKm: store.businessNameKm || null,
      businessType: store.businessType ?? 'RESTAURANT',
      categories,
      fullName: store.fullName,
      username: store.username,
      password: store.password,
      phoneNumber: store.phoneNumber,
    };
  }

  async function handleNext() {
    setSubmitError(null);

    if (currentStep === 5) {
      const errors = validateStep5();
      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        return;
      }
      setStepErrors({});
    }

    if (currentStep === 6) {
      if (otpValue !== '123456') {
        setOtpError('Incorrect code. Please try again.');
        return;
      }
      setOtpError('');
      store.setOtpVerified(true);
    }

    if (currentStep === 7) {
      setSubmitting(true);
      try {
        const result = await submitOnboarding(buildPayload());
        // Clear any stale owner/business state before setting the new token
        useOwnerSessionStore.getState().clearOwner();
        useOwnerBusinessesStore.getState().clearBusinesses();
        useOwnerAuthStore.getState().setToken(result.accessToken);
        void navigate('/owner/analytics', { replace: true });
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          setStepErrors({ username: 'This username is already taken.' });
          setSubmitError('Username is already taken. Please choose a different one and try again.');
          setCurrentStep(5);
        } else {
          setSubmitError(
            err instanceof ApiError
              ? err.message
              : 'Account creation failed. Please check your connection and try again.',
          );
        }
        setSubmitting(false);
      }
      return; // Do not advance step — navigate handles success; error stays here
    }

    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setOtpError('');
    setSubmitError(null);
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  function handleResendOtp() {
    setOtpValue('');
    setOtpError('');
    setOtpResent(true);
    setTimeout(() => setOtpResent(false), 3000);
  }

  const nextLabel =
    currentStep === 6 ? 'Verify Code' :
    currentStep === 7 ? (submitting ? 'Creating account…' : 'I Have Paid') :
    'Continue';

  const progressPct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="mx-auto max-w-lg">

        {/* Top bar */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => void navigate('/subscribe')}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to plan selection
          </button>

          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </p>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-[10px] font-bold">
              DT
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <h2 className="mt-3 text-xl font-black text-foreground">
            {STEP_TITLES[currentStep - 1]}
          </h2>
        </div>

        {/* Step card */}
        <div className="rounded-2xl border border-border bg-card p-5 mb-5 shadow-sm">
          {currentStep === 1 && <StepBusinessInfo />}
          {currentStep === 2 && <StepBusinessType />}
          {currentStep === 3 && <StepMenuTemplate />}
          {currentStep === 4 && <StepAgreement />}
          {currentStep === 5 && <StepAccountDetails errors={stepErrors} />}
          {currentStep === 6 && (
            <StepOtp
              otpValue={otpValue}
              otpError={otpError}
              otpResent={otpResent}
              onOtpChange={(v) => {
                setOtpValue(v);
                if (otpError) setOtpError('');
              }}
              onResend={handleResendOtp}
            />
          )}
          {currentStep === 7 && <StepPayment />}
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || submitting}
            className="w-24 shrink-0 rounded-xl"
          >
            <ArrowLeftIcon className="size-4 mr-1" />
            Back
          </Button>
          <Button
            type="button"
            onClick={() => void handleNext()}
            disabled={isNextDisabled()}
            className="flex-1 rounded-xl font-semibold"
          >
            {nextLabel}
            {currentStep < 6 && !submitting && (
              <ArrowRightIcon className="size-4 ml-1.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
