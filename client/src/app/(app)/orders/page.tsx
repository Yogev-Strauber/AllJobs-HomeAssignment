"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/services/api-client";
import type { Order, OrderStatus } from "@/types/api";
import { useAuth } from "@/context/auth-context";
import { currency, dateTime } from "@/utils/format";
import { describeError } from "@/utils/errors";
import { EmptyState, ErrorMessage, Loading } from "@/components/feedback";
import { StatusBadge } from "@/components/status-badge";

export default function OrdersPage() {
  const { auth, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [changing, setChanging] = useState<number | null>(null);

  useEffect(() => {
    if (!auth) return;
    api
      .orders(auth.accessToken, status || undefined)
      .then((result) => {
        setOrders(result);
        setError("");
      })
      .catch((caught) =>
        setError(describeError(caught, "Unable to load orders.")),
      )
      .finally(() => setLoading(false));
  }, [auth, status]);

  async function changeStatus(id: number, nextStatus: "Paid" | "Cancelled") {
    setChanging(id);
    setError("");
    try {
      await api.updateOrderStatus(auth?.accessToken ?? null, id, nextStatus);
      setOrders((items) =>
        items.map((item) =>
          item.id === id ? { ...item, status: nextStatus } : item,
        ),
      );
    } catch (caught) {
      setError(describeError(caught, "Unable to update order status."));
    } finally {
      setChanging(null);
    }
  }

  return (
    <section>
      <header className="content-header">
        <div>
          <p className="eyebrow">Fulfillment</p>
          <h1>Orders</h1>
          <p className="muted">
            Review customer orders and track their lifecycle.
          </p>
        </div>
        {isAdmin && (
          <Link className="btn btn-primary" href="/orders/new">
            Create order
          </Link>
        )}
      </header>
      <div className="toolbar">
        <div className="field orders-status-field">
          <label htmlFor="order-status">Status</label>
          <select
            id="order-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as OrderStatus | "")
            }
          >
            <option value="">All statuses</option>
            <option value="New">New</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      {error && <ErrorMessage message={error} />}
      {loading ? (
        <Loading label="Loading orders..." />
      ) : orders.length === 0 ? (
        <div className="panel">
          <EmptyState>No orders match the current filter.</EmptyState>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link className="link" href={`/orders/${order.id}`}>
                      #{order.id}
                    </Link>
                  </td>
                  <td>
                    <strong>{order.customerName}</strong>
                    <br />
                    <span className="muted">{order.customerEmail}</span>
                  </td>
                  <td>{currency(order.totalAmount)}</td>
                  <td>{dateTime(order.createdAt)}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>
                    {isAdmin && order.status === "New" && (
                      <div className="actions">
                        <button
                          className="btn btn-quiet"
                          disabled={changing === order.id}
                          onClick={() => changeStatus(order.id, "Paid")}
                        >
                          Mark paid
                        </button>
                        <button
                          className="btn btn-quiet"
                          disabled={changing === order.id}
                          onClick={() => changeStatus(order.id, "Cancelled")}
                        >
                          Cancel
                        </button>
                      </div>
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
