import { checkoutQuote, type CartItem, type CheckoutQuote } from './api';

export type PaymentType = 'COD' | 'Prepaid';

type CacheEntry = { quote: CheckoutQuote; createdAt: number };

const cache = new Map<string, CacheEntry>();

function stableCartItemsSignature(items: CartItem[]): string {
  const normalized = (Array.isArray(items) ? items : [])
    .map((i) => ({
      productId: String(i.productId || ''),
      size: String(i.size || ''),
      color: String(i.color || ''),
      gsm: Number(i.gsm || 0),
      qty: Number(i.qty || 0),
    }))
    .sort((a, b) => {
      const ak = `${a.productId}|${a.size}|${a.color}|${a.gsm}`;
      const bk = `${b.productId}|${b.size}|${b.color}|${b.gsm}`;
      return ak.localeCompare(bk);
    });
  return JSON.stringify(normalized);
}

export function checkoutSignature(input: { items: CartItem[]; pincode: string }): string {
  const pin = String(input.pincode || '').trim();
  return `${pin}::${stableCartItemsSignature(input.items)}`;
}

function keyOf(sig: string, paymentType: PaymentType): string {
  return `${sig}::${paymentType}`;
}

export function invalidateCheckoutQuoteCache(): void {
  cache.clear();
}

export async function getOrFetchCheckoutQuote(input: {
  signature: string;
  paymentType: PaymentType;
}): Promise<CheckoutQuote> {
  const key = keyOf(input.signature, input.paymentType);
  const hit = cache.get(key);
  if (hit) return hit.quote;

  const quote = await checkoutQuote({ paymentType: input.paymentType });
  cache.set(key, { quote, createdAt: Date.now() });
  return quote;
}

