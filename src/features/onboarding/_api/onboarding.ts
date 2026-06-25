// Onboarding API — public endpoint, no auth header required.
// POST /api/onboarding creates owner + business + seeded catalog in one transaction.

import { apiFetch } from '@/lib/api/client';

export interface OnboardingCategoryItem {
  name: string;
  products: string[];
}

export interface OnboardingSubmitRequest {
  plan: string;
  extraItemPacks: number;
  extraUserPacks: number;
  businessName: string;
  businessNameKm?: string | null;
  businessType: string;
  categories: OnboardingCategoryItem[];
  fullName: string;
  username: string;
  password: string;
  phoneNumber: string;
}

export interface OnboardingResult {
  accessToken: string;
  owner: {
    id: string;
    email: string;
    username: string;
    name: string | null;
    role: string;
  };
  businessId: string;
  businessSlug: string;
}

export async function submitOnboarding(
  request: OnboardingSubmitRequest
): Promise<OnboardingResult> {
  return apiFetch<OnboardingResult>({
    method: 'POST',
    url: '/onboarding',
    data: request,
  });
}
