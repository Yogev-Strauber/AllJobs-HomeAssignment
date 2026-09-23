import type {
  AuthResult,
  CreateOrderRequest,
  CreateProductRequest,
  Order,
  OrderStatus,
  ProblemDetails,
  Product,
  ProductStatus,
  UpdateProductRequest,
  UserRole,
} from "@/types/api";

export class ApiError extends Error {
  status: number;
  problem?: ProblemDetails;

  constructor(status: number, message: string, problem?: ProblemDetails) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

let unauthorizedHandler: (() => void) | undefined;

export function setUnauthorizedHandler(handler: (() => void) | undefined) {
  unauthorizedHandler = handler;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      "The server could not be reached. Check your connection and try again.",
    );
  }

  const text = await response.text();
  let problem: ProblemDetails | undefined;
  if (text) {
    try {
      problem = JSON.parse(text) as ProblemDetails;
    } catch {
      problem = undefined;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && options.token) {
      unauthorizedHandler?.();
    }
    const message =
      problem?.detail || problem?.title || getStatusMessage(response.status);
    throw new ApiError(response.status, message, problem);
  }

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

function getStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Please check the submitted information.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested record was not found.";
    case 409:
      return "This request conflicts with the current data.";
    default:
      return status >= 500
        ? "The server encountered an error."
        : "The request could not be completed.";
  }
}

function withToken(
  token: string | null,
  options: RequestOptions = {},
): RequestOptions {
  return { ...options, token };
}

export const api = {
  login: (body: { email: string; password: string }) =>
    request<AuthResult>("/auth/login", { method: "POST", body }),
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    mobile: string;
    address: string;
  }) => request<AuthResult>("/auth/register", { method: "POST", body }),
  products: (
    token: string | null,
    filters?: { search?: string; status?: ProductStatus },
  ) => {
    const query = new URLSearchParams();
    if (filters?.search) query.set("Search", filters.search);
    if (filters?.status) query.set("Status", filters.status);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<Product[]>(`/products${suffix}`, withToken(token));
  },
  product: (token: string | null, id: number) =>
    request<Product>(`/products/${id}`, withToken(token)),
  createProduct: (token: string | null, body: CreateProductRequest) =>
    request<{ id: number }>(
      "/products",
      withToken(token, { method: "POST", body }),
    ),
  updateProduct: (
    token: string | null,
    id: number,
    body: UpdateProductRequest,
  ) =>
    request<void>(`/products/${id}`, withToken(token, { method: "PUT", body })),
  updateProductStatus: (
    token: string | null,
    id: number,
    status: ProductStatus,
  ) =>
    request<void>(
      `/products/${id}/status`,
      withToken(token, { method: "PATCH", body: { status } }),
    ),
  orders: (token: string | null, status?: OrderStatus) => {
    const suffix = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<Order[]>(`/orders${suffix}`, withToken(token));
  },
  order: (token: string | null, id: number) =>
    request<Order>(`/orders/${id}`, withToken(token)),
  createOrder: (token: string | null, body: CreateOrderRequest) =>
    request<{ id: number }>(
      "/orders",
      withToken(token, { method: "POST", body }),
    ),
  updateOrderStatus: (token: string | null, id: number, status: OrderStatus) =>
    request<void>(
      `/orders/${id}/status`,
      withToken(token, { method: "PATCH", body: { status } }),
    ),
};

export type { UserRole };
