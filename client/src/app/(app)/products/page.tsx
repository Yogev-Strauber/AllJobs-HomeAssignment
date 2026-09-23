"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/services/api-client";
import type { Product, ProductStatus } from "@/types/api";
import { useAuth } from "@/context/auth-context";
import { describeError } from "@/utils/errors";
import { currency } from "@/utils/format";
import { EmptyState, ErrorMessage, Loading } from "@/components/feedback";
import { StatusBadge } from "@/components/status-badge";

export default function ProductsPage() {
  const { auth, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [changing, setChanging] = useState<number | null>(null);

  useEffect(() => {
    if (!auth) return;
    api
      .products(auth.accessToken, { search, status: status || undefined })
      .then((result) => {
        setProducts(result);
        setError("");
      })
      .catch((caught) =>
        setError(describeError(caught, "Unable to load products.")),
      )
      .finally(() => setLoading(false));
  }, [auth, search, status]);

  async function toggle(product: Product) {
    setChanging(product.id);
    setError("");
    try {
      await api.updateProductStatus(
        auth?.accessToken ?? null,
        product.id,
        product.status === "Active" ? "Inactive" : "Active",
      );
      setProducts((items) =>
        items.map((item) =>
          item.id === product.id
            ? {
                ...item,
                status: item.status === "Active" ? "Inactive" : "Active",
              }
            : item,
        ),
      );
    } catch (caught) {
      setError(describeError(caught, "Unable to update product status."));
    } finally {
      setChanging(null);
    }
  }

  return (
    <section>
      <header className="content-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Products</h1>
          <p className="muted">
            Search inventory and keep product availability current.
          </p>
        </div>
        {isAdmin && (
          <Link className="btn btn-primary" href="/products/new">
            Add product
          </Link>
        )}
      </header>
      <div className="toolbar">
        <div className="field products-search-field">
          <label htmlFor="search">Search name or SKU</label>
          <input
            id="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="e.g. SKU-104"
          />
        </div>
        <div className="field products-status-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ProductStatus | "")
            }
          >
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      {error && <ErrorMessage message={error} />}
      {loading ? (
        <Loading label="Loading products..." />
      ) : products.length === 0 ? (
        <div className="panel">
          <EmptyState>No products match the current filters.</EmptyState>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link className="link" href={`/products/${product.id}`}>
                      {product.name}
                    </Link>
                  </td>
                  <td>{product.sku}</td>
                  <td>{currency(product.price)}</td>
                  <td>{product.stockQuantity}</td>
                  <td>
                    <StatusBadge status={product.status} />
                  </td>
                  <td>
                    {isAdmin && (
                      <button
                        className="btn btn-quiet"
                        disabled={changing === product.id}
                        onClick={() => toggle(product)}
                      >
                        {changing === product.id
                          ? "Saving..."
                          : product.status === "Active"
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
