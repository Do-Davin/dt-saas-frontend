import { useNavigate } from 'react-router';
import { MinusIcon, PlusIcon, CheckIcon, ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '../_store/onboardingStore';
import {
  PLANS,
  ADDON_ITEM_PRICE,
  ADDON_USER_PRICE,
  ADDON_ITEM_PACK_SIZE,
  ADDON_USER_PACK_SIZE,
  BASE_ITEMS,
  BASE_USERS,
} from '../_types/onboarding.types';

function Stepper({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrement}
        disabled={value === 0}
        className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <MinusIcon className="size-3.5" />
      </button>
      <span className="w-5 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <PlusIcon className="size-3.5" />
      </button>
    </div>
  );
}

export function PlanSelectionPage() {
  const navigate = useNavigate();
  const store = useOnboardingStore();
  const { selectedPlan, extraItemPacks, extraUserPacks } = store;

  const activePlan = PLANS.find((p) => p.id === selectedPlan);
  const base = activePlan?.monthlyPrice ?? 0;
  const total = base + extraItemPacks * ADDON_ITEM_PRICE + extraUserPacks * ADDON_USER_PRICE;
  const itemLimit = BASE_ITEMS + extraItemPacks * ADDON_ITEM_PACK_SIZE;
  const userLimit = BASE_USERS + extraUserPacks * ADDON_USER_PACK_SIZE;
  const showTotal = selectedPlan !== null && selectedPlan !== 'CUSTOM';

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Brand + header */}
        <div className="mb-8 text-center">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold mb-4">
            DT
          </span>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Choose Your Plan
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            14-day free trial included. No credit card required to start.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid gap-3 sm:grid-cols-3 mb-5">
          {PLANS.map((plan) => {
            const selected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => store.setPlan(plan.id)}
                className={cn(
                  'relative rounded-2xl border p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-accent/20',
                )}
              >
                {plan.highlight && (
                  <span className="absolute -top-2.5 left-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Popular
                  </span>
                )}
                {selected && (
                  <span className="absolute right-3 top-3">
                    <CheckIcon className="size-4 text-primary" />
                  </span>
                )}
                <p className="text-sm font-semibold text-foreground mb-1.5">{plan.name}</p>
                {plan.monthlyPrice !== null ? (
                  <p className="text-2xl font-black text-foreground leading-none">
                    ${plan.monthlyPrice.toFixed(2)}
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">/mo</span>
                  </p>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">Contact us</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground leading-snug">
                  {plan.billingNote}
                </p>
              </button>
            );
          })}
        </div>

        {/* Base limits */}
        <div className="rounded-xl border border-border bg-card p-4 mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
            Base includes
          </p>
          <div className="flex gap-6 text-sm text-foreground">
            <span>
              <span className="font-semibold">{BASE_ITEMS}</span> menu items
            </span>
            <span>
              <span className="font-semibold">{BASE_USERS}</span> user account
            </span>
          </div>
        </div>

        {/* Add-ons */}
        <div className="rounded-xl border border-border bg-card p-4 mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Add-ons
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  +{ADDON_ITEM_PACK_SIZE} menu items
                </p>
                <p className="text-xs text-muted-foreground">
                  ${ADDON_ITEM_PRICE}/mo per pack · {itemLimit} items total
                </p>
              </div>
              <Stepper
                value={extraItemPacks}
                onDecrement={() => store.setExtraItemPacks(extraItemPacks - 1)}
                onIncrement={() => store.setExtraItemPacks(extraItemPacks + 1)}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  +{ADDON_USER_PACK_SIZE} user accounts
                </p>
                <p className="text-xs text-muted-foreground">
                  ${ADDON_USER_PRICE}/mo per pack · {userLimit} user{userLimit !== 1 ? 's' : ''} total
                </p>
              </div>
              <Stepper
                value={extraUserPacks}
                onDecrement={() => store.setExtraUserPacks(extraUserPacks - 1)}
                onIncrement={() => store.setExtraUserPacks(extraUserPacks + 1)}
              />
            </div>
          </div>
        </div>

        {/* Monthly total */}
        {showTotal && (
          <div className="rounded-xl border border-border bg-card px-4 py-3 mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Monthly total</p>
            <p className="text-xl font-black text-foreground">
              ${total.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
          </div>
        )}

        <Button
          className="w-full rounded-xl font-semibold"
          disabled={!selectedPlan}
          onClick={() => void navigate('/subscribe/onboard')}
        >
          Register &amp; Continue
          <ArrowRightIcon className="size-4 ml-1.5" />
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="underline underline-offset-2 hover:text-foreground">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
