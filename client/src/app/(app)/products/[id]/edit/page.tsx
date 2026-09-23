"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { ErrorMessage, Loading } from "@/components/feedback";
import { useAuth } from "@/context/auth-context";
import { api } from "@/services/api-client";
import type { Product } from "@/types/api";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { auth, isAdmin, isReady } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (isReady && !isAdmin) router.replace("/products");
    if (auth && isAdmin)
      api
        .product(auth.accessToken, Number(id))
        .then(setProduct)
        .catch(() => setError("Unable to load product."));
  }, [auth, id, isAdmin, isReady, router]);
  if (!isAdmin) return null;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <Loading label="Loading product..." />;
  return (
    <section>
      <header className="content-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Edit product</h1>
          <p className="muted">Update product information and inventory.</p>
        </div>
      </header>
      <ProductForm product={product} />
    </section>
  );
}
