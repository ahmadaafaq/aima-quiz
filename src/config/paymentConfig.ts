/**
 * AIMA Centralized Payment Hub Integration Configuration
 * 
 * Safely enables payment hub integration on staging (aima-quiz.vercel.app)
 * and localhost, while keeping the main production app (research.aima.in)
 * running in its existing production mode.
 */

export interface PaymentInitiationParams {
  reference: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  purpose?: string;
  returnPath?: string;
}

/**
 * Checks if the current environment is the live production site (research.aima.in).
 */
export function isLiveProduction(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    (host === 'research.aima.in' || host.endsWith('.research.aima.in')) &&
    !new URLSearchParams(window.location.search).get('demo')
  );
}

/**
 * Payment Hub is active for testing on aima-quiz.vercel.app, localhost, and preview branches.
 * Strictly disabled on research.aima.in to ensure production continuity.
 */
export function isPaymentHubEnabled(): boolean {
  if (isLiveProduction()) {
    return false;
  }
  return true;
}

/**
 * Resolves the AIMA Centralized Payment Hub URL.
 * Defaults to http://localhost:3000 during local testing, or https://payments.aima.in in staging/cloud.
 */
export function getPaymentHubUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_PAYMENT_HUB_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local') ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      (window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443');

    if (isLocal) {
      return `http://${host}:3002`;
    }

    // In production on research.aima.in:
    // Rewrites in vercel.json route /pay, /checkout/:token, and /api/* directly to aima-payments-hub
    return window.location.origin;
  }

  // Deployed cloud fallback URL
  return 'https://aima-payments-hub.vercel.app';
}

/**
 * Project Code mapped in the AIMA Centralized Payment Hub registry.
 * Mapped to Case League & Olympiad -> HDFC / CCAvenue.
 */
export const SOURCE_PROJECT_CODE = 'CASE_LEAGUE';

/**
 * Redirects user to the AIMA Centralized Payment Hub common payment initiation URL.
 * Example URL:
 * https://payments.aima.in/pay?source=AMIACRC&reference=REG123&amount=200&currency=INR&return_url=...
 */
export function initiatePaymentRedirect(params: PaymentInitiationParams): void {
  if (typeof window === 'undefined') return;

  const hubUrl = getPaymentHubUrl();
  const returnOrigin = window.location.origin;
  const returnPath = params.returnPath || window.location.pathname;
  const returnUrl = `${returnOrigin}${returnPath}`;

  const query = new URLSearchParams({
    source: SOURCE_PROJECT_CODE,
    reference: params.reference,
    amount: String(params.amount),
    currency: 'INR',
    return_url: returnUrl,
    name: params.customerName,
    email: params.customerEmail,
    phone: params.customerPhone || '',
    purpose: params.purpose || 'REGISTRATION_FEE',
  });

  const targetUrl = `${hubUrl}/pay?${query.toString()}`;
  console.info('[PaymentHub] Redirecting to Centralized Payment Hub:', targetUrl);
  window.location.href = targetUrl;
}
