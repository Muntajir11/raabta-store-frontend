export const AUTH_TOKEN_KEY = 'raabta_token';
export const AUTH_EVENT_NAME = 'raabta-auth-changed';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthPayload = {
  user: AuthUser;
  token: string;
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

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    throw new Error(
      'VITE_API_URL is not set. Copy .env.example to .env and set VITE_API_URL (e.g. http://localhost:5000).'
    );
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

async function postAuthJson<T extends AuthPayload>(
  path: string,
  body: Record<string, string>
): Promise<T> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const parsed = await parseJson(res);

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

  const data = parsed.data;
  if (!isRecord(data)) {
    throw new ApiRequestError('Invalid response', res.status);
  }

  const user = data.user;
  const token = data.token;
  if (
    !isRecord(user) ||
    typeof user.id !== 'string' ||
    typeof user.name !== 'string' ||
    typeof user.email !== 'string' ||
    typeof token !== 'string'
  ) {
    throw new ApiRequestError('Invalid response', res.status);
  }

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
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

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME));
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME));
}
