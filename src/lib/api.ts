export const AUTH_EVENT_NAME = 'raabta-auth-changed';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
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

export type ProductItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
  gsmOptions: ProductGsmOption[];
};

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
  return { id: user.id, name: user.name, email: user.email };
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
}): Promise<AuthPayload> {
  return postAuthJson<AuthPayload>('/api/auth/register', {
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
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
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      sizes,
      colors,
      gsmOptions,
    };
  });
}
