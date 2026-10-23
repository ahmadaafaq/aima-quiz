// Dynamic Environment Routing:
// 1. Live Production (research.aima.in): 100% Free Early Bird Entry (₹0) for real students.
// 2. Staging / UAT (aima-quiz.vercel.app or localhost): Standard ₹200 fee for Razorpay Security Audit & Demos.
// 3. Override: Any domain with ?audit=1 or ?fee=200 forces the standard ₹200 fee.
// ============================================================================

export function checkIsEarlyBirdFree(): boolean {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  const search = window.location.search;

  // 1. Audit / testing override via URL query parameter (?audit=1, ?audit=true, ?fee=200)
  if (search.includes('audit=') || search.includes('fee=200') || search.includes('uat=1')) {
    return false;
  }

  // 2. UAT / Staging environment (aima-quiz.vercel.app, preview deployments, or localhost):
  // Charges standard ₹200 fee for Razorpay Security Audit & Client Demos
  if (
    host === 'aima-quiz.vercel.app' ||
    host.endsWith('.vercel.app') ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0'
  ) {
    return false;
  }

  // 3. Live Production (research.aima.in):
  // Early Bird 100% Free Entry active for real students!
  return true;
}

export const IS_EARLY_BIRD_FREE = checkIsEarlyBirdFree();
export const PARTICIPATION_FEE_PER_PERSON = 200;
export const EARLY_BIRD_FEE_PER_PERSON = 0;

export const FEE_TIERS = [
  {
    id: 'per_student',
    label: 'Standard Registration',
    rateExclGst: 200,
    rateInclGst: 200,
    isPackage: false,
    minCount: 1,
    maxCount: 4,
    subLabel: '₹200 per student participant',
  },
];
