import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { Loading } from "@/components/feedback";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <Loading />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
