import { useApp } from "@/lib/app-context";
import type { DocumentStatus } from "@/types/api";
import type { DictKey } from "@/i18n/en";

const styles: Record<DocumentStatus, string> = {
  ready: "border-success bg-success-soft text-success",
  processing: "border-primary bg-accent text-accent-foreground",
  pending: "border-border bg-muted text-muted-foreground",
  failed: "border-destructive bg-danger-soft text-destructive",
  inactive: "border-border bg-card text-muted-foreground line-through",
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { t } = useApp();
  return <span className={`inline-flex rounded border px-1.5 py-0.5 text-xs font-medium ${styles[status]}`}>{t(`st_${status}` as DictKey)}</span>;
}
