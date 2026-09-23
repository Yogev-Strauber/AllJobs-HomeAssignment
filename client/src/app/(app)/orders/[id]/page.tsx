"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/services/api-client";
import type { Order } from "@/types/api";
import { useAuth } from "@/context/auth-context";
import { currency, dateTime } from "@/utils/format";
import { describeError } from "@/utils/errors";
import { ErrorMessage, Loading } from "@/components/feedback";
import { StatusBadge } from "@/components/status-badge";

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { auth, isAdmin } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!auth) return;
    api
      .order(auth.accessToken, Number(id))
      .then(setOrder)
      .catch((caught) =>
        setError(describeError(caught, "Unable to load order.")),
      )
      .finally(() => setLoading(false));
  }, [auth, id]);

  async function changeStatus(status: "Paid" | "Cancelled") {
    if (!order) return;
    setBusy(true);
    setError("");
    try {
      await api.updateOrderStatus(auth?.accessToken ?? null, order.id, status);
      setOrder({ ...order, status });
    } catch (caught) {
      setError(describeError(caught, "Unable to update order status."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading label="Loading order..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return <ErrorMessage message="Order not found." />;
  return (
    <section>
      <header className="content-header">
        <div>
          <p className="eyebrow">Order detail</p>
          <h1>Order #{order.id}</h1>
          <p className="muted">Created {dateTime(order.createdAt)}</p>
        </div>
        {isAdmin && order.status === "New" && (
          <div className="actions">
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={() => changeStatus("Paid")}
            >
              Mark paid
            </button>
            <button
              className="btn btn-danger"
              disabled={busy}
              onClick={() => changeStatus("Cancelled")}
            >
              Cancel order
            </button>
          </div>
        )}
      </header>
      <div className="panel stack">
        <dl className="detail-grid">
          <div>
            <dt>Customer</dt>
            <dd>{order.customerName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{order.customerEmail}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={order.status} />
            </dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{currency(order.totalAmount)}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{dateTime(order.updatedAt)}</dd>
          </div>
        </dl>
        <h2>Items</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit price</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link className="link" href={`/products/${item.productId}`}>
                      Product #{item.productId}
                    </Link>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{currency(item.unitPrice)}</td>
                  <td>{currency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
