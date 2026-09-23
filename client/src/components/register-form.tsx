"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError } from "@/services/api-client";
import { useAuth } from "@/context/auth-context";
import { ErrorMessage } from "@/components/feedback";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { register } = useAuth();
  const [registration, setRegistration] = useState({
    email: params.get("email") ?? "",
    password: "",
    firstName: "",
    lastName: "",
    mobile: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(key: keyof typeof registration, value: string) {
    setRegistration((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (
      registration.password.length < 8 ||
      !passwordPattern.test(registration.password)
    ) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await register(registration);
      router.replace("/products");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to create the account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          all<span>jobs</span>
        </div>
        <p className="eyebrow">Viewer registration</p>
        <h1>Create an account</h1>
        <p className="muted">New accounts start with read-only access.</p>
        <form className="stack" onSubmit={submit}>
          {error && <ErrorMessage message={error} />}
          <div className="form-grid">
            {(
              [
                ["email", "Email", "email"],
                ["firstName", "First name", "text"],
                ["lastName", "Last name", "text"],
                ["mobile", "Mobile", "tel"],
              ] as const
            ).map(([key, label, type]) => (
              <div className="field" key={key}>
                <label htmlFor={key}>{label}</label>
                <input
                  id={key}
                  type={type}
                  required
                  value={registration[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                />
              </div>
            ))}
            <div className="field wide">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={registration.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
              />
            </div>
            <div className="field wide">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                required
                value={registration.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="auth-footer">
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
