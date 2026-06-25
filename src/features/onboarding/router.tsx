import type { RouteObject } from 'react-router';
import { PlanSelectionPage } from './_pages/PlanSelectionPage';
import { OnboardingWizardPage } from './_pages/OnboardingWizardPage';

export const onboardingRoutes: RouteObject[] = [
  { path: '/subscribe',        element: <PlanSelectionPage /> },
  { path: '/subscribe/onboard', element: <OnboardingWizardPage /> },
];
