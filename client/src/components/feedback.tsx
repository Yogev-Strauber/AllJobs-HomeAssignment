export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <p className="loading" role="status">
      {label}
    </p>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="error" role="alert">
      {message}
    </p>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="empty">{children}</div>;
}
