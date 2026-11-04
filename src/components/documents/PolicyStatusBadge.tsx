import { useApp } from "@/lib/app-context";
import type { PolicyStatus } from "@/types/api";
import type { DictKey } from "@/i18n/en";

const styles: Record<PolicyStatus, string> = {
  current: "border-success bg-success-soft text-success",
  upcoming: "border-warning bg-warning-soft text-warning",
  previous: "border-border bg-muted text-muted-foreground",
};

export function PolicyStatusBadge({ status }: { status: PolicyStatus }) {
  const { t } = useApp();
  return <span className={`inline-flex whitespace-nowrap rounded border px-1.5 py-0.5 text-xs font-medium ${styles[status]}`}>{t(`ps_${status}` as DictKey)}</span>;
}
