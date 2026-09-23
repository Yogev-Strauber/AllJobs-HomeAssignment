"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrderForm } from "@/components/order-form";
import { useAuth } from "@/context/auth-context";

export default function NewOrderPage() {
  const { isAdmin, isReady } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isReady && !isAdmin) router.replace("/orders");
  }, [isAdmin, isReady, router]);
  if (!isAdmin) return null;
  return (
    <section>
      <header className="content-header">
        <div>
          <p className="eyebrow">Fulfillment</p>
          <h1>Create order</h1>
          <p className="muted">Reserve available inventory for a customer.</p>
        </div>
      </header>
      <OrderForm />
    </section>
  );
}
