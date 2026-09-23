export type UserRole = "Admin" | "Viewer";
export type ProductStatus = "Active" | "Inactive";
export type OrderStatus = "New" | "Cancelled" | "Paid";

export interface AuthResult {
  accessToken: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  price: number;
  stockQuantity: number;
}

export type UpdateProductRequest = CreateProductRequest;

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  items: Array<{ productId: number; quantity: number }>;
}

export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[] | string>;
}
