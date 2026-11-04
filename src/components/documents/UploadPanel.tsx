import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/api";
import { errorMessageKey, useApp } from "@/lib/app-context";
import { isMock } from "@/lib/config";
import type { DocumentStatus, UploadMetadata } from "@/types/api";
import type { DictKey } from "@/i18n/en";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "./StatusBadge";

const empty: UploadMetadata = { title: "", department: "", country: "", language: "en", version: "", effective_date: "" };

export function UploadPanel({ onUploaded }: { onUploaded: () => void }) {
  const { t } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof UploadMetadata | "file", DictKey>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<{ id: string; status: DocumentStatus } | null>(null);
  const [apiErr, setApiErr] = useState<DictKey | null>(null);

  useEffect(() => {
    if (!job || job.status === "ready" || job.status === "failed") return;
    const h = setInterval(() => {
      api.getJob(job.id).then((j) => { setJob({ id: j.id, status: j.status }); onUploaded(); }).catch(() => {});
    }, 800);
    return () => clearInterval(h);
  }, [job, onUploaded]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!file) errs.file = "errFileRequired";
    else if (!/\.(md|txt)$/i.test(file.name)) errs.file = "errFileType";
    else if (file.size > 5 * 1024 * 1024) errs.file = "errFileSize";
    (["title", "department", "country", "version", "effective_date"] as const).forEach((k) => { if (!meta[k].trim()) errs[k] = "errRequired"; });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true); setApiErr(null);
    try {
      const r = await api.uploadDocument(file!, meta);
      setJob({ id: r.job_id, status: r.status });
      setMeta(empty); setFile(null);
      onUploaded();
    } catch (e) {
      setApiErr(errorMessageKey(e));
    } finally {
      setSubmitting(false);
    }
  };

  const field = (k: keyof UploadMetadata, label: DictKey, type = "text") => (
    <label className="block text-sm">
      <span className="mb-1 block text-muted-foreground">{t(label)}</span>
      <Input type={type} value={meta[k]} onChange={(e) => setMeta({ ...meta, [k]: e.target.value })}
        aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `err-${k}` : undefined} className="bg-card" />
      {errors[k] && <span id={`err-${k}`} className="mt-1 block text-xs text-destructive">{t(errors[k]!)}</span>}
    </label>
  );

  return (
    <section className="rounded-lg border bg-card p-5 shadow-panel" aria-labelledby="upload-h">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 id="upload-h" className="font-semibold">{t("uploadHeading")}</h2>
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{t("uploadAdminOnly")}</span>
      </div>
      {isMock && <p className="mb-4 rounded-md border border-warning bg-warning-soft p-3 text-sm text-warning">{t("uploadMockNote")}</p>}
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-muted-foreground">{t("file")}</span>
          <input type="file" accept=".md,.txt,text/markdown,text/plain" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            aria-invalid={!!errors.file} className="block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-secondary file:px-3 file:py-1.5" />
          {errors.file && <span className="mt-1 block text-xs text-destructive">{t(errors.file)}</span>}
        </label>
        {field("title", "title")}
        {field("department", "department")}
        {field("country", "country")}
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">{t("language")}</span>
          <select value={meta.language} onChange={(e) => setMeta({ ...meta, language: e.target.value })} className="w-full rounded-md border bg-card px-2 py-2">
            <option value="en">EN</option><option value="ko">KO</option>
          </select>
        </label>
        {field("version", "version")}
        {field("effective_date", "effectiveDate", "date")}
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={submitting}>{submitting ? t("uploading") : t("upload")}</Button>
          {job && <span role="status" className="flex items-center gap-2 text-sm">{t("uploadQueued")} <StatusBadge status={job.status} /></span>}
          {apiErr && <span role="alert" className="text-sm text-destructive">{t(apiErr)}</span>}
        </div>
      </form>
    </section>
  );
}
