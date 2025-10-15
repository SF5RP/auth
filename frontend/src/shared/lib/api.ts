import Cookies from "js-cookie";
import type { HeadersInit } from "undici";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function camelCaseKeys<T>(input: T): T {
  if (Array.isArray(input)) {
    // @ts-expect-error runtime transform
    return input.map((item) => camelCaseKeys(item)) as unknown as T;
  }
  if (isPlainObject(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const newKey = toCamelCase(key);
      // @ts-expect-error recursive transform
      result[newKey] = camelCaseKeys(value);
    }
    return result as unknown as T;
  }
  return input;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = false, headers, ...restOptions } = options;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...headers,
  };

  if (requiresAuth) {
    const token = Cookies.get("accessToken");
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...restOptions,
    headers: requestHeaders,
    credentials: "include",
    mode: "cors",
    cache: "no-cache",
  });

  if (!response.ok) {
    if (response.status === 401) {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    const errorPayload: unknown = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    const errorMessage =
      isPlainObject(errorPayload) && typeof errorPayload.message === "string"
        ? errorPayload.message
        : response.statusText;
    throw new Error(errorMessage || "API request failed");
  }

  // 204 No Content safety
  if (response.status === 204) {
    // @ts-expect-error generic void
    return undefined;
  }

  const json: unknown = await response.json();
  return camelCaseKeys(json as unknown as T);
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
