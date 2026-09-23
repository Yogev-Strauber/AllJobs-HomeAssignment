"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/api";
import { api } from "@/services/api-client";
import { useAuth } from "@/context/auth-context";
import { describeError } from "@/utils/errors";
import { ErrorMessage } from "@/components/feedback";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { auth } = useAuth();
  const [productForm, setProductForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    description: product?.description ?? "",
    price: product?.price.toString() ?? "",
    stockQuantity: product?.stockQuantity.toString() ?? "",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateField(key: keyof typeof productForm, value: string) {
    setProductForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const price = Number(productForm.price);
    const stockQuantity = Number(productForm.stockQuantity);
    if (
      !productForm.name.trim() ||
      !productForm.sku.trim() ||
      !Number.isFinite(price) ||
      price < 0.01 ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setError(
        "Enter a name, SKU, positive price, and nonnegative whole-number stock quantity.",
      );
      return;
    }
    setIsSaving(true);
    try {
      const body = {
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        description: productForm.description.trim() || undefined,
        price,
        stockQuantity,
      };
      if (product) {
        await api.updateProduct(auth?.accessToken ?? null, product.id, body);
        router.push(`/products/${product.id}`);
      } else {
        const result = await api.createProduct(auth?.accessToken ?? null, body);
        router.push(`/products/${result.id}`);
      }
    } catch (caught) {
      setError(describeError(caught, "Unable to save the product."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="panel stack" onSubmit={submit}>
      {error && <ErrorMessage message={error} />}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            maxLength={200}
            required
            value={productForm.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="sku">SKU</label>
          <input
            id="sku"
            maxLength={100}
            required
            value={productForm.sku}
            onChange={(event) => updateField("sku", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={productForm.price}
            onChange={(event) => updateField("price", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="stockQuantity">Stock quantity</label>
          <input
            id="stockQuantity"
            type="number"
            min="0"
            step="1"
            required
            value={productForm.stockQuantity}
            onChange={(event) =>
              updateField("stockQuantity", event.target.value)
            }
          />
        </div>
        <div className="field wide">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            maxLength={1000}
            value={productForm.description}
            onChange={(event) => updateField("description", event.target.value)}
          />
        </div>
      </div>
      <div className="actions">
        <button className="btn btn-primary" disabled={isSaving}>
          {isSaving ? "Saving..." : product ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
