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
  return host === 'research.aima.in' || host.endsWith('.research.aima.in');
}

/**
 * Payment Hub is active across all environments including research.aima.in.
 */
export function isPaymentHubEnabled(): boolean {
  return true;
}

/**
 * Resolves the AIMA Centralized Payment Hub URL.
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

    // On research.aima.in, route through the official /payments reverse proxy
    if (host === 'research.aima.in' || host.endsWith('.research.aima.in')) {
      return 'https://research.aima.in/payments';
    }

    // Staging / preview cloud fallback URL
    return 'https://aima-payments-hub.vercel.app';
  }

  // Deployed cloud fallback URL
  return 'https://aima-payments-hub.vercel.app';
}

/**
 * Project Code mapped in the AIMA Centralized Payment Hub registry.
 * Mapped to Case League & Olympiad -> HDFC / CCAvenue.
 */
export const SOURCE_PROJECT_CODE = 'CASE_LEAGUE';
export const SOURCE_SHARED_SECRET = 'aima_case_league_demo_key_phase3_sandbox_2026';

/**
 * Computes HMAC-SHA256 signature using browser standard Web Crypto API.
 */
export async function computePaymentSignature(secret: string, message: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const enc = new TextEncoder();
      const key = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBuffer = await window.crypto.subtle.sign('HMAC', key, enc.encode(message));
      return Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch (err) {
    console.warn('[PaymentHub] Could not compute crypto signature:', err);
  }
  return '';
}

/**
 * Redirects user to the AIMA Centralized Payment Hub common payment initiation URL.
 * Example URL:
 * https://payments.aima.in/pay?source=CASE_LEAGUE&reference=REG123&amount=200&currency=INR&return_url=...&timestamp=...&signature=...
 */
export async function initiatePaymentRedirect(params: PaymentInitiationParams): Promise<void> {
  if (typeof window === 'undefined') return;

  const hubUrl = getPaymentHubUrl();
  const returnOrigin = window.location.origin;
  const returnPath = params.returnPath || window.location.pathname;
  const returnUrl = `${returnOrigin}${returnPath}`;
  const timestamp = Math.floor(Date.now() / 1000);

  // Canonical payload for cryptographic integrity protection:
  // SOURCE:REFERENCE:AMOUNT:CURRENCY:TIMESTAMP
  const canonical = `${SOURCE_PROJECT_CODE}:${params.reference}:${params.amount}:INR:${timestamp}`;
  const signature = await computePaymentSignature(SOURCE_SHARED_SECRET, canonical);

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
    timestamp: String(timestamp),
  });

  if (signature) {
    query.set('signature', signature);
  }

  const targetUrl = `${hubUrl}/pay?${query.toString()}`;
  console.info('[PaymentHub] Redirecting to Centralized Payment Hub (Signed):', targetUrl);
  window.location.href = targetUrl;
}
