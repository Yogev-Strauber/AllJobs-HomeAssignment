"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/services/api-client";
import type { Product } from "@/types/api";
import { useAuth } from "@/context/auth-context";
import { currency, dateTime } from "@/utils/format";
import { describeError } from "@/utils/errors";
import { ErrorMessage, Loading } from "@/components/feedback";
import { StatusBadge } from "@/components/status-badge";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { auth, isAdmin } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!auth) return;
    api
      .product(auth.accessToken, Number(id))
      .then(setProduct)
      .catch((caught) =>
        setError(describeError(caught, "Unable to load product.")),
      )
      .finally(() => setLoading(false));
  }, [auth, id]);

  async function toggle() {
    if (!product) return;
    setBusy(true);
    setError("");
    try {
      await api.updateProductStatus(
        auth?.accessToken ?? null,
        product.id,
        product.status === "Active" ? "Inactive" : "Active",
      );
      setProduct({
        ...product,
        status: product.status === "Active" ? "Inactive" : "Active",
      });
    } catch (caught) {
      setError(describeError(caught, "Unable to update product status."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading label="Loading product..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <ErrorMessage message="Product not found." />;
  return (
    <section>
      <header className="content-header">
        <div>
          <p className="eyebrow">Product detail</p>
          <h1>{product.name}</h1>
          <p className="muted">SKU {product.sku}</p>
        </div>
        {isAdmin && (
          <div className="actions">
            <Link
              className="btn btn-secondary"
              href={`/products/${product.id}/edit`}
            >
              Edit
            </Link>
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={toggle}
            >
              {busy
                ? "Saving..."
                : product.status === "Active"
                  ? "Deactivate"
                  : "Activate"}
            </button>
          </div>
        )}
      </header>
      <div className="panel stack">
        <dl className="detail-grid">
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={product.status} />
            </dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>{currency(product.price)}</dd>
          </div>
          <div>
            <dt>Available stock</dt>
            <dd>{product.stockQuantity}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{dateTime(product.createdAt)}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{dateTime(product.updatedAt)}</dd>
          </div>
        </dl>
        <div>
          <h2>Description</h2>
          <p className="muted">
            {product.description || "No description provided."}
          </p>
        </div>
      </div>
    </section>
  );
}
