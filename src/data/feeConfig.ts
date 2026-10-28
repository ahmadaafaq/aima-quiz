// Dynamic Environment Routing:
// 1. Live Production (research.aima.in): 100% Free Early Bird Entry (₹0) for real students.
// 2. Staging / UAT (aima-quiz.vercel.app or localhost): Standard ₹200 fee for Razorpay Security Audit & Demos.
// 3. Override: Any domain with ?audit=1, ?fee=200, ?fee=500, ?amount=200, or ?amount=500 forces the specified test fee for comparative audit testing.
// ============================================================================

export function checkIsEarlyBirdFree(): boolean {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  const search = window.location.search;

  // 1. Audit / testing override via URL query parameter (?audit=1, ?audit=true, ?fee=200, ?fee=500, ?amount=500, ?uat=1)
  if (
    search.includes('audit=') ||
    search.includes('fee=200') ||
    search.includes('fee=500') ||
    search.includes('amount=200') ||
    search.includes('amount=500') ||
    search.includes('uat=1')
  ) {
    return false;
  }

  // 2. Early Bird 100% Free Entry active universally across both live production (research.aima.in)
  // and staging/preview deployments (aima-quiz.vercel.app) for all students!
  return true;
}

export function getInitialFeeTierId(): string {
  if (typeof window === 'undefined') return 'per_student';
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const fee = params.get('fee') || params.get('amount');
  if (fee === '500') {
    return 'comparative_tier';
  }
  return 'per_student';
}

export const IS_EARLY_BIRD_FREE = checkIsEarlyBirdFree();
export const PARTICIPATION_FEE_PER_PERSON = 200;
export const COMPARATIVE_TEST_FEE_PER_PERSON = 500;
export const EARLY_BIRD_FEE_PER_PERSON = 0;

export interface FeeTier {
  id: string;
  label: string;
  rateExclGst: number;
  rateInclGst: number;
  isPackage: boolean;
  minCount: number;
  maxCount: number;
  subLabel: string;
}

export const FEE_TIERS: FeeTier[] = [
  {
    id: 'per_student',
    label: 'Standard Registration',
    rateExclGst: 200,
    rateInclGst: 200,
    isPackage: false,
    minCount: 1,
    maxCount: 4,
    subLabel: '₹200 per student participant (Base Tier)',
  },
  {
    id: 'comparative_tier',
    label: 'Executive Track & Case Masterclass',
    rateExclGst: 500,
    rateInclGst: 500,
    isPackage: false,
    minCount: 1,
    maxCount: 4,
    subLabel: '₹500 per student participant (Comparative Testing Tier)',
  },
];
