import type { OrderStatus, ProductStatus } from "@/types/api";

export function StatusBadge({
  status,
}: {
  status: ProductStatus | OrderStatus;
}) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>{status}</span>
  );
}
