import { useCallback, useEffect, useState } from "react";
import { api } from "@/api";
import { errorMessageKey, useApp } from "@/lib/app-context";
import type { DocumentDetail, DocumentStatus, DocumentSummary, PolicyStatus } from "@/types/api";
import type { DictKey } from "@/i18n/en";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "./StatusBadge";
import { PolicyStatusBadge } from "./PolicyStatusBadge";
import { UploadPanel } from "./UploadPanel";

const departments = ["People Ops", "Finance", "Security", "Engineering", "IT"];
const processingStatuses: DocumentStatus[] = ["pending", "processing", "ready", "failed", "inactive"];
const policyStatuses: PolicyStatus[] = ["current", "upcoming", "previous"];

export function DocumentsPage({ docId }: { docId?: string | undefined } = {}) {
  const { t, me, isAdmin } = useApp();
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("");
  const [language, setLanguage] = useState("");
  const [policyStatus, setPolicyStatus] = useState("current");
  const [procStatus, setProcStatus] = useState("");
  const [items, setItems] = useState<DocumentSummary[] | null>(null);
  const [err, setErr] = useState<DictKey | null>(null);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  useEffect(() => {
    if (docId) api.getDocument(docId).then(setDetail).catch((e) => setErr(errorMessageKey(e)));
  }, [docId]);

  const load = useCallback(() => {
    setErr(null);
    api.listDocuments({ q, department, language, policy_status: policyStatus, status: procStatus }).then((r) => setItems(r.items)).catch((e) => setErr(errorMessageKey(e)));
  }, [q, department, language, policyStatus, procStatus]);
  useEffect(() => { const h = setTimeout(load, 150); return () => clearTimeout(h); }, [load]);

  const canUpload = me?.capabilities.includes("documents:upload") ?? false;
  const sel = "rounded-md border bg-card px-2 py-2 text-sm";
  const colCount = isAdmin ? 8 : 7;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t("documentsHeading")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("documentsSub")} · {t("fictionalCorpus")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="min-w-56 flex-1">
          <span className="sr-only">{t("search")}</span>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} className="bg-card" />
        </label>
        <label><span className="sr-only">{t("department")}</span>
          <select className={sel} value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">{t("department")}: {t("all")}</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label><span className="sr-only">{t("language")}</span>
          <select className={sel} value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">{t("language")}: {t("all")}</option>
            <option value="en">EN</option><option value="ko">KO</option>
          </select>
        </label>
        <label><span className="sr-only">{t("policyStatus")}</span>
          <select className={sel} value={policyStatus} onChange={(e) => setPolicyStatus(e.target.value)}>
            <option value="">{t("policyStatus")}: {t("all")}</option>
            {policyStatuses.map((s) => <option key={s} value={s}>{t(`ps_${s}` as DictKey)}</option>)}
          </select>
        </label>
        {isAdmin && (
          <label><span className="sr-only">{t("processingStatus")}</span>
            <select className={sel} value={procStatus} onChange={(e) => setProcStatus(e.target.value)}>
              <option value="">{t("processingStatus")}: {t("all")}</option>
              {processingStatuses.map((s) => <option key={s} value={s}>{t(`st_${s}` as DictKey)}</option>)}
            </select>
          </label>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-panel">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="border-b bg-muted text-left text-xs text-muted-foreground">
            <tr>
              {(["title", "department", "country", "language", "version", "effectiveDate", "policyStatus"] as DictKey[]).map((k) => (
                <th key={k} scope="col" className="px-3 py-2 font-medium">{t(k)}</th>
              ))}
              {isAdmin && <th scope="col" className="px-3 py-2 font-medium">{t("processingStatus")}</th>}
            </tr>
          </thead>
          <tbody>
            {err && <tr><td colSpan={colCount} role="alert" className="px-3 py-6 text-center text-destructive">{t(err)} <Button size="sm" variant="outline" onClick={load}>{t("retry")}</Button></td></tr>}
            {!err && items === null && <tr><td colSpan={colCount} className="px-3 py-6 text-center text-muted-foreground">{t("loading")}</td></tr>}
            {!err && items?.length === 0 && <tr><td colSpan={colCount} className="px-3 py-6 text-center text-muted-foreground">{t("noDocuments")}</td></tr>}
            {items?.map((d) => (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted">
                <td className="px-3 py-2">
                  <button className="text-left font-medium hover:text-primary hover:underline"
                    onClick={() => api.getDocument(d.id).then(setDetail).catch((e) => setErr(errorMessageKey(e)))}>
                    {d.title}
                  </button>
                </td>
                <td className="px-3 py-2">{d.department}</td>
                <td className="px-3 py-2">{d.country}</td>
                <td className="px-3 py-2">{d.language.toUpperCase()}</td>
                <td className="px-3 py-2 font-mono text-xs">{d.version}</td>
                <td className="px-3 py-2 whitespace-nowrap">{d.effective_date}</td>
                <td className="px-3 py-2"><PolicyStatusBadge status={d.policy_status} /></td>
                {isAdmin && <td className="px-3 py-2"><StatusBadge status={d.status} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canUpload ? <UploadPanel onUploaded={load} /> : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">{t("noUploadAccess")}</p>
      )}

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.document.title}</SheetTitle>
                <SheetDescription>{t("documentDetail")}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">{t("department")}</dt><dd>{detail.document.department}</dd>
                  <dt className="text-muted-foreground">{t("country")}</dt><dd>{detail.document.country}</dd>
                  <dt className="text-muted-foreground">{t("language")}</dt><dd>{detail.document.language.toUpperCase()}</dd>
                  <dt className="text-muted-foreground">{t("version")}</dt><dd>{detail.document.version}</dd>
                  <dt className="text-muted-foreground">{t("effectiveDate")}</dt><dd>{detail.document.effective_date}</dd>
                  <dt className="text-muted-foreground">{t("policyStatus")}</dt><dd><PolicyStatusBadge status={detail.document.policy_status} /></dd>
                  {isAdmin && (<>
                    <dt className="text-muted-foreground">{t("processingStatus")}</dt><dd><StatusBadge status={detail.document.status} /></dd>
                  </>)}
                </dl>
                {isAdmin && detail.document.status === "failed" && (
                  <p role="alert" className="rounded-lg border border-destructive/40 bg-danger-soft p-3 text-sm text-destructive">
                    {t("st_failed")}: {t("processingFailedNote")}
                  </p>
                )}
                {isAdmin && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled title={t("disabledBackend")}>{t("setActiveVersion")}</Button>
                    <Button size="sm" variant="outline" disabled title={t("disabledBackend")}>{t("retryIngestion")}</Button>
                  </div>
                )}
                {isAdmin && <p className="text-xs text-muted-foreground">{t("disabledBackend")}</p>}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">{t("sections")}</h3>
                  {detail.sections.length === 0 ? <p className="text-sm text-muted-foreground">{t("noSections")}</p> : (
                    <ul className="space-y-3">
                      {detail.sections.map((s) => (
                        <li key={s.id} className="rounded-md border bg-muted p-3 text-sm">
                          <div className="font-medium">{s.title}</div>
                          <p className="mt-1 leading-relaxed text-muted-foreground">{s.text}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
