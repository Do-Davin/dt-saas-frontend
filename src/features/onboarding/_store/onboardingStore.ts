import { create } from 'zustand';
import type { PlanId, BusinessTypeId } from '../_types/onboarding.types';

type AccountField = 'fullName' | 'username' | 'password' | 'confirmPassword' | 'phoneNumber';

interface OnboardingState {
  selectedPlan: PlanId | null;
  extraItemPacks: number;
  extraUserPacks: number;
  businessName: string;
  businessNameKm: string;
  businessType: BusinessTypeId | null;
  customCategories: string[];
  agreedToTerms: boolean;
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  otpVerified: boolean;
  paymentConfirmed: boolean;

  setPlan(plan: PlanId): void;
  setExtraItemPacks(n: number): void;
  setExtraUserPacks(n: number): void;
  setBusinessName(v: string): void;
  setBusinessNameKm(v: string): void;
  setBusinessType(v: BusinessTypeId): void;
  addCustomCategory(name: string): void;
  removeCustomCategory(name: string): void;
  setAgreedToTerms(v: boolean): void;
  setField(field: AccountField, value: string): void;
  setOtpVerified(v: boolean): void;
  setPaymentConfirmed(v: boolean): void;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  selectedPlan: null,
  extraItemPacks: 0,
  extraUserPacks: 0,
  businessName: '',
  businessNameKm: '',
  businessType: null,
  customCategories: [],
  agreedToTerms: false,
  fullName: '',
  username: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  otpVerified: false,
  paymentConfirmed: false,

  setPlan: (plan) => set({ selectedPlan: plan }),
  setExtraItemPacks: (n) => set({ extraItemPacks: Math.max(0, n) }),
  setExtraUserPacks: (n) => set({ extraUserPacks: Math.max(0, n) }),
  setBusinessName: (v) => set({ businessName: v }),
  setBusinessNameKm: (v) => set({ businessNameKm: v }),
  setBusinessType: (v) => set({ businessType: v }),
  addCustomCategory: (name) => set((s) => ({ customCategories: [...s.customCategories, name] })),
  removeCustomCategory: (name) =>
    set((s) => ({ customCategories: s.customCategories.filter((c) => c !== name) })),
  setAgreedToTerms: (v) => set({ agreedToTerms: v }),
  setField: (field, value) => set({ [field]: value }),
  setOtpVerified: (v) => set({ otpVerified: v }),
  setPaymentConfirmed: (v) => set({ paymentConfirmed: v }),
}));
