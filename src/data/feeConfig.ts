// ============================================================================
// OFFICIAL PARTICIPATION FEE & EARLY BIRD PROMOTIONAL OFFER CONFIGURATION
// Set IS_EARLY_BIRD_FREE = false to seamlessly revert to standard ₹200 fee.
// ============================================================================
export const IS_EARLY_BIRD_FREE = true;
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
