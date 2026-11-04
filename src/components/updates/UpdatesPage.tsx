import { useEffect, useState } from "react";
import { api } from "@/api";
import { errorMessageKey, useApp } from "@/lib/app-context";
import type { PolicyUpdate } from "@/types/api";
import type { DictKey } from "@/i18n/en";
import { PolicyUpdateCard } from "./PolicyUpdateCard";

export function UpdatesPage() {
  const { t } = useApp();
  const [items, setItems] = useState<PolicyUpdate[] | null>(null);
  const [err, setErr] = useState<DictKey | null>(null);
  useEffect(() => { api.listUpdates().then((r) => setItems(r.items)).catch((e) => setErr(errorMessageKey(e))); }, []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{t("updatesHeading")}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{t("updatesSub")} · {t("fictionalCorpus")}</p>
      <div className="mt-6 space-y-4">
        {err && <p role="alert" className="text-destructive">{t(err)}</p>}
        {!err && !items && <p className="text-muted-foreground">{t("loading")}</p>}
        {items?.map((u, i) => <PolicyUpdateCard key={u.id} update={u} featured={i === 0} />)}
      </div>
    </div>
  );
}
