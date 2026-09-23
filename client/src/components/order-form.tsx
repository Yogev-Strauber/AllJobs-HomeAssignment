"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/api";
import { api } from "@/services/api-client";
import { useAuth } from "@/context/auth-context";
import { currency } from "@/utils/format";
import { describeError } from "@/utils/errors";
import { ErrorMessage, Loading } from "@/components/feedback";

interface SelectedProduct {
  product: Product;
  quantity: number;
}

interface OrderLineProps {
  item: SelectedProduct;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

function OrderLine({ item, onQuantityChange, onRemove }: OrderLineProps) {
  const { product, quantity } = item;

  return (
    <div className="order-line">
      <div>
        <strong>{product.name}</strong>
        <br />
        <small className="muted">
          {currency(product.price)} each · {product.stockQuantity} available
        </small>
      </div>
      <div className="field">
        <label htmlFor={`quantity-${product.id}`}>Quantity</label>
        <input
          id={`quantity-${product.id}`}
          type="number"
          min="1"
          max={product.stockQuantity}
          value={quantity}
          onChange={(event) =>
            onQuantityChange(product.id, Number(event.target.value))
          }
        />
      </div>
      <strong className="line-price">
        {currency(product.price * quantity)}
      </strong>
      <button
        type="button"
        className="btn btn-quiet"
        onClick={() => onRemove(product.id)}
      >
        Remove
      </button>
    </div>
  );
}

export function OrderForm() {
  const router = useRouter();
  const { auth } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!auth) return;

    api
      .products(auth.accessToken, { status: "Active" })
      .then(setProducts)
      .catch((caught) =>
        setError(describeError(caught, "Unable to load available products.")),
      )
      .finally(() => setIsLoading(false));
  }, [auth]);

  const availableProducts = products.filter(
    (product) =>
      !selectedProducts.some((item) => item.product.id === product.id),
  );

  const total = selectedProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  function addProduct() {
    const product = products.find(
      (item) => item.id === Number(selectedProductId),
    );
    if (!product) return;

    setSelectedProducts((items) => [...items, { product, quantity: 1 }]);
    setSelectedProductId("");
  }

  function updateQuantity(id: number, quantity: number) {
    setSelectedProducts((items) =>
      items.map((item) =>
        item.product.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(quantity || 1, item.product.stockQuantity),
              ),
            }
          : item,
      ),
    );
  }

  function removeProduct(id: number) {
    setSelectedProducts((items) =>
      items.filter((item) => item.product.id !== id),
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      selectedProducts.length === 0
    ) {
      setError(
        "Customer name, a valid email, and at least one product are required.",
      );
      return;
    }
    if (
      selectedProducts.some(
        (item) => item.quantity > item.product.stockQuantity,
      )
    ) {
      setError("A requested quantity exceeds the displayed stock.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await api.createOrder(auth?.accessToken ?? null, {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        items: selectedProducts.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });
      router.push(`/orders/${result.id}`);
    } catch (caught) {
      setError(describeError(caught, "Unable to create the order."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <Loading label="Loading available products..." />;

  return (
    <form className="stack" onSubmit={submit}>
      {error && <ErrorMessage message={error} />}
      <div className="panel stack">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="customerName">Customer name</label>
            <input
              id="customerName"
              maxLength={200}
              required
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="customerEmail">Customer email</label>
            <input
              id="customerEmail"
              type="email"
              maxLength={320}
              required
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="panel stack">
        <div className="content-header" style={{ marginBottom: 0 }}>
          <div>
            <h2>Products</h2>
            <p className="muted">
              Only active products are available for new orders.
            </p>
          </div>
          <div className="actions">
            <select
              aria-label="Select product"
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
            >
              <option value="">Select product</option>
              {availableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.stockQuantity} available)
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!selectedProductId}
              onClick={addProduct}
            >
              Add
            </button>
          </div>
        </div>
        {selectedProducts.length === 0 ? (
          <p className="muted">Add at least one product to continue.</p>
        ) : (
          <div className="order-lines">
            {selectedProducts.map((item) => (
              <OrderLine
                key={item.product.id}
                item={item}
                onQuantityChange={updateQuantity}
                onRemove={removeProduct}
              />
            ))}
          </div>
        )}
        <div className="total">
          <span>Estimated total</span>
          <span>{currency(total)}</span>
        </div>
      </div>
      <button
        className="btn btn-primary"
        disabled={isSubmitting || selectedProducts.length === 0}
      >
        {isSubmitting ? "Creating order..." : "Create order"}
      </button>
    </form>
  );
}
