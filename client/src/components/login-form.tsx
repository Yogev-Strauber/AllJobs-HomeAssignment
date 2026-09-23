"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { isUnknownUserError, useAuth } from "@/context/auth-context";
import { ApiError } from "@/services/api-client";
import { ErrorMessage } from "@/components/feedback";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { auth, isReady, login } = useAuth();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isReady)
    return (
      <main className="auth-page">
        <p className="loading">Loading...</p>
      </main>
    );
  if (auth) {
    router.replace("/products");
    return null;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.replace("/products");
    } catch (caught) {
      if (isUnknownUserError(caught)) {
        router.push(`/register?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(
        caught instanceof ApiError ? caught.message : "Unable to sign in.",
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
        <p className="eyebrow">Operations workspace</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage products and orders.</p>
        <form className="stack" onSubmit={submit}>
          {error && <ErrorMessage message={error} />}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="auth-footer">
          New to AllJobs?{" "}
          <Link
            href={`/register${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          >
            Create a viewer account
          </Link>
        </p>
      </section>
    </main>
  );
}
