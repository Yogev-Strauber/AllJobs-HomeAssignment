"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Loading } from "@/components/feedback";
import { useAuth } from "@/context/auth-context";

export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  const router = useRouter();
  const { auth, isReady } = useAuth();
  useEffect(() => {
    if (isReady && !auth) router.replace("/login");
  }, [auth, isReady, router]);
  if (!isReady || !auth)
    return (
      <main className="auth-page">
        <Loading label="Checking your session..." />
      </main>
    );
  return <AppShell>{children}</AppShell>;
}
