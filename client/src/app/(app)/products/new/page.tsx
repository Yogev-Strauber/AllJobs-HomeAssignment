"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { useAuth } from "@/context/auth-context";

export default function NewProductPage() {
  const { isAdmin, isReady } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isReady && !isAdmin) router.replace("/products");
  }, [isAdmin, isReady, router]);
  if (!isAdmin) return null;
  return (
    <section>
      <header className="content-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Add product</h1>
          <p className="muted">
            Create an active product with its current inventory.
          </p>
        </div>
      </header>
      <ProductForm />
    </section>
  );
}
