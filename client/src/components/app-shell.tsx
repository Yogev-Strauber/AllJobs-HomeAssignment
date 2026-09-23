"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, isAdmin, logout } = useAuth();
  const isPathActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="brand" href="/products">
          all<span>jobs</span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <Link
            className={isPathActive("/products") ? "active" : ""}
            href="/products"
          >
            Products
          </Link>
          <Link
            className={isPathActive("/orders") ? "active" : ""}
            href="/orders"
          >
            Orders
          </Link>
          {isAdmin && (
            <Link
              className={isPathActive("/orders/new") ? "active" : ""}
              href="/orders/new"
            >
              Create order
            </Link>
          )}
        </nav>
        <div className="account">
          <strong>
            {auth?.firstName} {auth?.lastName}
          </strong>
          <small>
            {auth?.role} · {auth?.email}
          </small>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
