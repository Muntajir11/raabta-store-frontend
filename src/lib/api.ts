export const AUTH_EVENT_NAME = 'raabta-auth-changed';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  gender?: 'male' | 'female';
  avatarSeed?: string;
};

export type ProfileUser = AuthUser & {
  role: string;
  phone: string;
  state: string;
  city: string;
  pincode: string;
  landmark: string;
  address: string;
  gender: 'male' | 'female';
  avatarSeed: string;

  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingLandmark: string;
  shippingPincode: string;
  shippingCity: string;
  shippingState: string;
  shippingCountry: 'India';
  deliveryInstructions: string;
  marketingOptIn: boolean;
};

export type ProfileUpdateInput = {
  name?: string;
  gender?: 'male' | 'female';
  marketingOptIn?: boolean;

  shippingName?: string;
  shippingPhone?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingLandmark?: string;
  shippingPincode?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: 'India';
  deliveryInstructions?: string;
};

export type AuthPayload = {
  user: AuthUser;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  size: string;
  color: string;
  gsm: number;
  qty: number;
  lineTotal: number;
};

export type CartPayload = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
};

export type CartUpsertInput = {
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  size: string;
  color: string;
  gsm: number;
  qty: number;
};

export type CartMutationInput = {
  productId: string;
  size: string;
  color: string;
  gsm: number;
  qty: number;
};

export type CartItemIdentity = Pick<CartMutationInput, 'productId' | 'size' | 'color' | 'gsm'>;

export type ProductGsmOption = {
  gsm: number;
  price: number;
};

export type ProductInventoryRow = {
  size: string;
  color: string;
  gsm: number;
  qty: number;
};

export type ProductItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
  gsmOptions: ProductGsmOption[];
  inventory?: ProductInventoryRow[];
};

export type WishlistPayload = {
  items: string[];
};

export type ReviewItem = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type CheckoutQuote = {
  subtotal: number;
  shipping: number;
  total: number;
  serviceable: boolean;
  pincode: string;
  itemCount: number;
  chargeableGrams: number;
  provider: 'delhivery' | 'fallback';
  shippingBreakdown?: {
    lines: { key: string; label: string; amount: number }[];
    meta?: { chargedWeightGrams?: number; zone?: string };
  } | null;
};

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type PaymentMethod = 'cod' | 'prepaid';

export type OrderListItem = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  total: number;
  itemsCount: number;
  firstItem?: {
    productId: string;
    name: string;
    image?: string;
    size?: string;
    color?: string;
    gsm?: number;
  } | null;
  moreCount?: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  image?: string;
  category?: string;
  size: string;
  color: string;
  gsm: number;
  qty: number;
  unitPrice: number;
  designId?: string;
};

export type ShippingAddress = {
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
};

export type ContactSubmitInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  shippingExclGst?: number | null;
  shippingGst?: { cgst?: number | null; sgst?: number | null; igst?: number | null } | null;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  shippingAddress?: ShippingAddress | null;
  inventoryReserved?: boolean;
};

export async function reviewsList(productId: string): Promise<{ items: ReviewItem[] }> {
  const qp = new URLSearchParams({ productId });
  const { res, parsed } = await requestJson(`/api/reviews?${qp.toString()}`, { method: 'GET' });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true || !isRecord(parsed.data) || !Array.isArray(parsed.data.items)) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  const items = parsed.data.items
    .filter((v) => isRecord(v))
    .map((v) => ({
      id: String((v as Record<string, unknown>).id || ''),
      productId: String((v as Record<string, unknown>).productId || ''),
      userId: String((v as Record<string, unknown>).userId || ''),
      rating: Number((v as Record<string, unknown>).rating || 0),
      comment: String((v as Record<string, unknown>).comment || ''),
      createdAt: String((v as Record<string, unknown>).createdAt || ''),
    }))
    .filter((r) => r.id && r.productId && r.userId && r.rating >= 1 && r.rating <= 5);
  return { items };
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

/**
 * API origin for fetch calls. When `VITE_API_URL` is unset (e.g. Vercel static
 * without env), uses "" so paths like `/api/products` hit the current origin.
 * Set `VITE_API_URL` in production when the API is on another host.
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return '';
  }
  return raw.replace(/\/$/, '');
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function readErrorMessage(body: unknown, fallback: string): string {
  if (!isRecord(body)) return fallback;
  const msg = body.message;
  return typeof msg === 'string' && msg.trim() ? msg : fallback;
}

function readErrorCode(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined;
  const code = body.code;
  return typeof code === 'string' ? code : undefined;
}

function validateUser(data: unknown, status: number): AuthUser {
  if (!isRecord(data)) {
    throw new ApiRequestError('Invalid response', status);
  }
  const user = data.user;
  if (
    !isRecord(user) ||
    typeof user.id !== 'string' ||
    typeof user.name !== 'string' ||
    typeof user.email !== 'string'
  ) {
    throw new ApiRequestError('Invalid response', status);
  }
  const gender = user.gender === 'male' || user.gender === 'female' ? user.gender : undefined;
  const avatarSeed = typeof user.avatarSeed === 'string' ? user.avatarSeed : undefined;
  return { id: user.id, name: user.name, email: user.email, gender, avatarSeed };
}

function validateProfileUser(data: unknown, status: number): ProfileUser {
  if (!isRecord(data)) {
    throw new ApiRequestError('Invalid response', status);
  }
  const user = data.user;
  if (
    !isRecord(user) ||
    typeof user.id !== 'string' ||
    typeof user.name !== 'string' ||
    typeof user.email !== 'string' ||
    typeof user.role !== 'string' ||
    (user.gender !== 'male' && user.gender !== 'female') ||
    typeof user.avatarSeed !== 'string' ||
    typeof user.shippingName !== 'string' ||
    typeof user.shippingPhone !== 'string' ||
    typeof user.shippingAddressLine1 !== 'string' ||
    typeof user.shippingAddressLine2 !== 'string' ||
    typeof user.shippingLandmark !== 'string' ||
    typeof user.shippingPincode !== 'string' ||
    typeof user.shippingCity !== 'string' ||
    typeof user.shippingState !== 'string' ||
    typeof user.shippingCountry !== 'string' ||
    typeof user.deliveryInstructions !== 'string' ||
    typeof user.phone !== 'string' ||
    typeof user.state !== 'string' ||
    typeof user.city !== 'string' ||
    typeof user.pincode !== 'string' ||
    typeof user.landmark !== 'string' ||
    typeof user.address !== 'string' ||
    typeof user.marketingOptIn !== 'boolean'
  ) {
    throw new ApiRequestError('Invalid response', status);
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    gender: user.gender,
    avatarSeed: user.avatarSeed,

    shippingName: user.shippingName,
    shippingPhone: user.shippingPhone,
    shippingAddressLine1: user.shippingAddressLine1,
    shippingAddressLine2: user.shippingAddressLine2,
    shippingLandmark: user.shippingLandmark,
    shippingPincode: user.shippingPincode,
    shippingCity: user.shippingCity,
    shippingState: user.shippingState,
    shippingCountry: user.shippingCountry === 'India' ? 'India' : 'India',
    deliveryInstructions: user.deliveryInstructions,
    phone: user.phone,
    state: user.state,
    city: user.city,
    pincode: user.pincode,
    landmark: user.landmark,
    address: user.address,
    marketingOptIn: user.marketingOptIn,
  };
}

function validateCart(data: unknown, status: number): CartPayload {
  if (!isRecord(data) || !Array.isArray(data.items)) {
    throw new ApiRequestError('Invalid response', status);
  }
  const items: CartItem[] = data.items.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.productId !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.price !== 'number' ||
      typeof item.image !== 'string' ||
      typeof item.category !== 'string' ||
      typeof item.size !== 'string' ||
      typeof item.color !== 'string' ||
      typeof item.gsm !== 'number' ||
      typeof item.qty !== 'number' ||
      typeof item.lineTotal !== 'number'
    ) {
      throw new ApiRequestError('Invalid response', status);
    }
    return {
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      size: item.size,
      color: item.color,
      gsm: item.gsm,
      qty: item.qty,
      lineTotal: item.lineTotal,
    };
  });

  const totalItems = data.totalItems;
  const subtotal = data.subtotal;
  if (typeof totalItems !== 'number' || typeof subtotal !== 'number') {
    throw new ApiRequestError('Invalid response', status);
  }
  return { items, totalItems, subtotal };
}

async function requestJson(path: string, init: RequestInit): Promise<{ res: Response; parsed: unknown }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, {
    credentials: 'include',
    ...init,
  });
  const parsed = await parseJson(res);
  return { res, parsed };
}

export async function contactSubmit(input: ContactSubmitInput): Promise<void> {
  const { res, parsed } = await requestJson('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      message: input.message.trim(),
    }),
  });

  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }

  if (!isRecord(parsed) || parsed.success !== true) {
    const message = readErrorMessage(parsed, 'Invalid response');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
}

async function postAuthJson<T extends AuthPayload>(
  path: string,
  body: Record<string, string>
): Promise<T> {
  const { res, parsed } = await requestJson(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }

  if (!isRecord(parsed) || parsed.success !== true) {
    const message = readErrorMessage(parsed, 'Invalid response');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }

  return {
    user: validateUser(isRecord(parsed) ? parsed.data : null, res.status),
  } as T;
}

export async function authLogin(input: {
  email: string;
  password: string;
}): Promise<AuthPayload> {
  return postAuthJson<AuthPayload>('/api/auth/login', {
    email: input.email.trim(),
    password: input.password,
  });
}

export async function authRegister(input: {
  name: string;
  email: string;
  password: string;
  gender: 'male' | 'female';
}): Promise<AuthPayload> {
  return postAuthJson<AuthPayload>('/api/auth/register', {
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
    gender: input.gender,
  });
}

export async function authLogout(): Promise<void> {
  const { res, parsed } = await requestJson('/api/auth/logout', {
    method: 'POST',
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME));
}

export async function authSession(): Promise<AuthUser | null> {
  const fetchSessionUser = async (): Promise<AuthUser | null> => {
    const { res, parsed } = await requestJson('/api/auth/session', {
      method: 'GET',
    });
    if (res.status === 401) return null;
    if (!res.ok) {
      const message = readErrorMessage(parsed, 'Request failed');
      const code = readErrorCode(parsed);
      throw new ApiRequestError(message, res.status, code);
    }

    if (!isRecord(parsed) || parsed.success !== true) {
      throw new ApiRequestError('Invalid response', res.status);
    }
    return validateUser(parsed.data, res.status);
  };

  const current = await fetchSessionUser();
  if (current) return current;

  const { res: refreshRes } = await requestJson('/api/auth/refresh', {
    method: 'POST',
  });
  if (!refreshRes.ok) return null;

  return fetchSessionUser();
}

export function notifyAuthChanged(): void {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME));
}

export async function profileGet(): Promise<ProfileUser> {
  const { res, parsed } = await requestJson('/api/me', { method: 'GET' });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateProfileUser(parsed.data, res.status);
}

export async function profileUpdate(input: ProfileUpdateInput): Promise<ProfileUser> {
  const body: Record<string, string | boolean> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.gender !== undefined) body.gender = input.gender;
  if (input.marketingOptIn !== undefined) body.marketingOptIn = input.marketingOptIn;
  if (input.shippingName !== undefined) body.shippingName = input.shippingName;
  if (input.shippingPhone !== undefined) body.shippingPhone = input.shippingPhone;
  if (input.shippingAddressLine1 !== undefined) body.shippingAddressLine1 = input.shippingAddressLine1;
  if (input.shippingAddressLine2 !== undefined) body.shippingAddressLine2 = input.shippingAddressLine2;
  if (input.shippingLandmark !== undefined) body.shippingLandmark = input.shippingLandmark;
  if (input.shippingPincode !== undefined) body.shippingPincode = input.shippingPincode;
  if (input.shippingCity !== undefined) body.shippingCity = input.shippingCity;
  if (input.shippingState !== undefined) body.shippingState = input.shippingState;
  if (input.shippingCountry !== undefined) body.shippingCountry = input.shippingCountry;
  if (input.deliveryInstructions !== undefined) body.deliveryInstructions = input.deliveryInstructions;

  const { res, parsed } = await requestJson('/api/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateProfileUser(parsed.data, res.status);
}

export async function passwordChange(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<AuthPayload> {
  const { res, parsed } = await requestJson('/api/me/password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    }),
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return {
    user: validateUser(isRecord(parsed) ? parsed.data : null, res.status),
  };
}

export async function cartGet(): Promise<CartPayload> {
  const { res, parsed } = await requestJson('/api/cart', { method: 'GET' });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateCart(parsed.data, res.status);
}

export async function cartAddItem(input: CartMutationInput): Promise<CartPayload> {
  const { res, parsed } = await requestJson('/api/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateCart(parsed.data, res.status);
}

export async function cartMerge(items: CartMutationInput[]): Promise<CartPayload> {
  const { res, parsed } = await requestJson('/api/cart/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateCart(parsed.data, res.status);
}

export async function cartUpdateItemQty(identity: CartItemIdentity, qty: number): Promise<CartPayload> {
  const { res, parsed } = await requestJson('/api/cart/items', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...identity, qty }),
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateCart(parsed.data, res.status);
}

export async function cartRemoveItem(identity: CartItemIdentity): Promise<CartPayload> {
  const { res, parsed } = await requestJson('/api/cart/items', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(identity),
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateCart(parsed.data, res.status);
}

export async function cartClear(): Promise<CartPayload> {
  const { res, parsed } = await requestJson('/api/cart', { method: 'DELETE' });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateCart(parsed.data, res.status);
}

export async function productsList(): Promise<ProductItem[]> {
  const { res, parsed } = await requestJson('/api/products', { method: 'GET' });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true || !isRecord(parsed.data) || !Array.isArray(parsed.data.items)) {
    throw new ApiRequestError('Invalid response', res.status);
  }

  return parsed.data.items.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.price !== 'number' ||
      typeof item.image !== 'string' ||
      typeof item.category !== 'string' ||
      !Array.isArray(item.sizes) ||
      !Array.isArray(item.colors) ||
      !Array.isArray(item.gsmOptions)
    ) {
      throw new ApiRequestError('Invalid response', res.status);
    }
    const sizes = item.sizes.filter((v): v is string => typeof v === 'string');
    const colors = item.colors.filter((v): v is string => typeof v === 'string');
    const gsmOptions = item.gsmOptions
      .filter((v) => isRecord(v) && typeof v.gsm === 'number' && typeof v.price === 'number')
      .map((v) => ({ gsm: v.gsm as number, price: v.price as number }));

    const inventoryRaw = isRecord(item) && Array.isArray((item as Record<string, unknown>).inventory)
      ? ((item as Record<string, unknown>).inventory as unknown[])
      : undefined;
    const inventory = inventoryRaw
      ? inventoryRaw
          .filter(
            (v) =>
              isRecord(v) &&
              typeof v.size === 'string' &&
              typeof v.color === 'string' &&
              typeof v.gsm === 'number' &&
              typeof v.qty === 'number'
          )
          .map((v) => ({
            size: String((v as Record<string, unknown>).size),
            color: String((v as Record<string, unknown>).color),
            gsm: Number((v as Record<string, unknown>).gsm),
            qty: Number((v as Record<string, unknown>).qty),
          }))
      : undefined;
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      sizes,
      colors,
      gsmOptions,
      inventory,
    };
  });
}

export async function wishlistGet(): Promise<WishlistPayload> {
  const { res, parsed } = await requestJson('/api/wishlist', { method: 'GET' });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true || !isRecord(parsed.data) || !Array.isArray(parsed.data.items)) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  const items = parsed.data.items.filter((v): v is string => typeof v === 'string');
  return { items };
}

export async function wishlistAdd(productId: string): Promise<WishlistPayload> {
  const { res, parsed } = await requestJson('/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true || !isRecord(parsed.data) || !Array.isArray(parsed.data.items)) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  const items = parsed.data.items.filter((v): v is string => typeof v === 'string');
  return { items };
}

export async function wishlistRemove(productId: string): Promise<WishlistPayload> {
  const { res, parsed } = await requestJson(`/api/wishlist/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true || !isRecord(parsed.data) || !Array.isArray(parsed.data.items)) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  const items = parsed.data.items.filter((v): v is string => typeof v === 'string');
  return { items };
}

function validateCheckoutQuote(data: unknown, status: number): CheckoutQuote {
  if (!isRecord(data)) {
    throw new ApiRequestError('Invalid response', status);
  }
  const requiredNumber = (k: string) => {
    const v = (data as Record<string, unknown>)[k];
    if (typeof v !== 'number') throw new ApiRequestError('Invalid response', status);
    return v;
  };
  const requiredString = (k: string) => {
    const v = (data as Record<string, unknown>)[k];
    if (typeof v !== 'string') throw new ApiRequestError('Invalid response', status);
    return v;
  };
  const requiredBool = (k: string) => {
    const v = (data as Record<string, unknown>)[k];
    if (typeof v !== 'boolean') throw new ApiRequestError('Invalid response', status);
    return v;
  };

  const providerRaw = requiredString('provider');
  const provider = providerRaw === 'delhivery' || providerRaw === 'fallback' ? providerRaw : null;
  if (!provider) throw new ApiRequestError('Invalid response', status);

  let shippingBreakdown: CheckoutQuote['shippingBreakdown'] = null;
  const sb = (data as Record<string, unknown>).shippingBreakdown;
  if (sb === null) {
    shippingBreakdown = null;
  } else if (isRecord(sb) && Array.isArray(sb.lines)) {
    const lines = sb.lines
      .filter((v) => isRecord(v))
      .map((v) => ({
        key: String((v as Record<string, unknown>).key || ''),
        label: String((v as Record<string, unknown>).label || ''),
        amount: Number((v as Record<string, unknown>).amount || 0),
      }))
      .filter((l) => l.key && l.label && Number.isFinite(l.amount));

    let meta: { chargedWeightGrams?: number; zone?: string } | undefined;
    if (isRecord(sb.meta)) {
      const m = sb.meta as Record<string, unknown>;
      const chargedWeightGrams = typeof m.chargedWeightGrams === 'number' ? m.chargedWeightGrams : undefined;
      const zone = typeof m.zone === 'string' ? m.zone : undefined;
      if (chargedWeightGrams !== undefined || zone !== undefined) meta = { chargedWeightGrams, zone };
    }
    shippingBreakdown = { lines, meta };
  }

  return {
    subtotal: requiredNumber('subtotal'),
    shipping: requiredNumber('shipping'),
    total: requiredNumber('total'),
    serviceable: requiredBool('serviceable'),
    pincode: requiredString('pincode'),
    itemCount: requiredNumber('itemCount'),
    chargeableGrams: requiredNumber('chargeableGrams'),
    provider,
    shippingBreakdown,
  };
}

export async function checkoutQuote(input?: { paymentType?: 'COD' | 'Prepaid' }): Promise<CheckoutQuote> {
  const { res, parsed } = await requestJson('/api/checkout/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input?.paymentType ? { paymentType: input.paymentType } : {}),
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateCheckoutQuote(parsed.data, res.status);
}

function validateOrderStatus(v: unknown, status: number): OrderStatus {
  const s = String(v || '');
  const allowed: OrderStatus[] = [
    'pending',
    'confirmed',
    'in_production',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ];
  if (!allowed.includes(s as OrderStatus)) throw new ApiRequestError('Invalid response', status);
  return s as OrderStatus;
}

function validatePaymentStatus(v: unknown, status: number): PaymentStatus {
  const s = String(v || '');
  const allowed: PaymentStatus[] = ['unpaid', 'paid', 'refunded'];
  if (!allowed.includes(s as PaymentStatus)) throw new ApiRequestError('Invalid response', status);
  return s as PaymentStatus;
}

function validatePaymentMethod(v: unknown, status: number): PaymentMethod {
  const s = String(v || '');
  const allowed: PaymentMethod[] = ['cod', 'prepaid'];
  if (!allowed.includes(s as PaymentMethod)) throw new ApiRequestError('Invalid response', status);
  return s as PaymentMethod;
}

function validateOrderListItem(data: unknown, status: number): OrderListItem {
  if (!isRecord(data)) throw new ApiRequestError('Invalid response', status);
  const firstItem =
    data.firstItem === null
      ? null
      : data.firstItem !== undefined
        ? (() => {
            if (!isRecord(data.firstItem)) throw new ApiRequestError('Invalid response', status);
            return {
              productId: String((data.firstItem as any).productId || ''),
              name: String((data.firstItem as any).name || ''),
              image: typeof (data.firstItem as any).image === 'string' ? (data.firstItem as any).image : undefined,
              size: typeof (data.firstItem as any).size === 'string' ? (data.firstItem as any).size : undefined,
              color: typeof (data.firstItem as any).color === 'string' ? (data.firstItem as any).color : undefined,
              gsm: typeof (data.firstItem as any).gsm === 'number' ? (data.firstItem as any).gsm : undefined,
            };
          })()
        : undefined;

  return {
    id: String(data.id || ''),
    orderNumber: String(data.orderNumber || ''),
    createdAt: String(data.createdAt || ''),
    status: validateOrderStatus(data.status, status),
    paymentStatus: validatePaymentStatus(data.paymentStatus, status),
    paymentMethod: validatePaymentMethod(data.paymentMethod, status),
    total: Number(data.total || 0),
    itemsCount: Number(data.itemsCount || 0),
    firstItem,
    moreCount: typeof data.moreCount === 'number' ? data.moreCount : undefined,
  };
}

function validateOrderItem(data: unknown, status: number): OrderItem {
  if (!isRecord(data)) throw new ApiRequestError('Invalid response', status);
  const base: OrderItem = {
    productId: String(data.productId || ''),
    name: String(data.name || ''),
    image: typeof data.image === 'string' ? data.image : undefined,
    category: typeof data.category === 'string' ? data.category : undefined,
    size: String(data.size || ''),
    color: String(data.color || ''),
    gsm: Number(data.gsm || 0),
    qty: Number(data.qty || 0),
    unitPrice: Number(data.unitPrice || 0),
  };
  const designId = typeof data.designId === 'string' ? data.designId : undefined;
  return designId ? { ...base, designId } : base;
}

function validateShippingAddress(data: unknown, status: number): ShippingAddress {
  if (!isRecord(data)) throw new ApiRequestError('Invalid response', status);
  return {
    phone: String(data.phone || ''),
    address: String(data.address || ''),
    city: String(data.city || ''),
    state: String(data.state || ''),
    pincode: String(data.pincode || ''),
    landmark: typeof data.landmark === 'string' ? data.landmark : undefined,
  };
}

function validateOrderDetail(data: unknown, status: number): OrderDetail {
  if (!isRecord(data) || !Array.isArray(data.items)) throw new ApiRequestError('Invalid response', status);
  const shippingAddress =
    data.shippingAddress === null
      ? null
      : data.shippingAddress !== undefined
        ? validateShippingAddress(data.shippingAddress, status)
        : undefined;

  return {
    id: String(data.id || ''),
    orderNumber: String(data.orderNumber || ''),
    createdAt: String(data.createdAt || ''),
    updatedAt: String(data.updatedAt || ''),
    items: data.items.map((i) => validateOrderItem(i, status)),
    subtotal: Number(data.subtotal || 0),
    shipping: Number(data.shipping || 0),
    shippingExclGst: typeof data.shippingExclGst === 'number' ? data.shippingExclGst : null,
    shippingGst: isRecord(data.shippingGst)
      ? {
          cgst: typeof (data.shippingGst as Record<string, unknown>).cgst === 'number' ? (data.shippingGst as any).cgst : null,
          sgst: typeof (data.shippingGst as Record<string, unknown>).sgst === 'number' ? (data.shippingGst as any).sgst : null,
          igst: typeof (data.shippingGst as Record<string, unknown>).igst === 'number' ? (data.shippingGst as any).igst : null,
        }
      : null,
    total: Number(data.total || 0),
    status: validateOrderStatus(data.status, status),
    paymentStatus: validatePaymentStatus(data.paymentStatus, status),
    paymentMethod: validatePaymentMethod(data.paymentMethod, status),
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    shippingAddress,
    inventoryReserved: typeof data.inventoryReserved === 'boolean' ? data.inventoryReserved : undefined,
  };
}

export async function placeCodOrder(): Promise<OrderDetail> {
  const { res, parsed } = await requestJson('/api/checkout/place', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentMethod: 'cod' }),
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateOrderDetail(parsed.data, res.status);
}

export async function myOrdersList(input?: { page?: number; limit?: number }): Promise<{
  items: OrderListItem[];
  page: number;
  limit: number;
  total: number;
}> {
  const qp = new URLSearchParams();
  if (typeof input?.page === 'number') qp.set('page', String(input.page));
  if (typeof input?.limit === 'number') qp.set('limit', String(input.limit));
  const path = qp.toString() ? `/api/me/orders?${qp.toString()}` : '/api/me/orders';
  const { res, parsed } = await requestJson(path, { method: 'GET' });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true || !isRecord(parsed.data) || !Array.isArray(parsed.data.items)) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return {
    items: parsed.data.items.map((v) => validateOrderListItem(v, res.status)).filter((o) => o.orderNumber),
    page: Number(parsed.data.page || 1),
    limit: Number(parsed.data.limit || 30),
    total: Number(parsed.data.total || 0),
  };
}

export async function myOrderDetail(orderNumber: string): Promise<OrderDetail> {
  const { res, parsed } = await requestJson(`/api/me/orders/${encodeURIComponent(orderNumber)}`, { method: 'GET' });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateOrderDetail(parsed.data, res.status);
}

export async function cancelMyOrder(orderNumber: string): Promise<OrderDetail> {
  const { res, parsed } = await requestJson(`/api/me/orders/${encodeURIComponent(orderNumber)}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const message = readErrorMessage(parsed, 'Request failed');
    const code = readErrorCode(parsed);
    throw new ApiRequestError(message, res.status, code);
  }
  if (!isRecord(parsed) || parsed.success !== true) {
    throw new ApiRequestError('Invalid response', res.status);
  }
  return validateOrderDetail(parsed.data, res.status);
}
