import { Suspense } from "react";
import { RegisterForm } from "@/components/register-form";
import { Loading } from "@/components/feedback";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <Loading />
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
