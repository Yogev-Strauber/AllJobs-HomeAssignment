"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loading } from "@/components/feedback";

export default function Home() {
  const router = useRouter();
  const { auth, isReady } = useAuth();

  useEffect(() => {
    if (isReady) router.replace(auth ? "/products" : "/login");
  }, [auth, isReady, router]);

  return (
    <main className="auth-page">
      <Loading label="Opening AllJobs..." />
    </main>
  );
}
