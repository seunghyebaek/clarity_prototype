// Small geometric mark: stacked document sheets with a connecting line.
export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden>
      <rect x="2" y="2" width="32" height="32" rx="9" className="fill-sidebar-primary" />
      <rect x="10" y="9" width="13" height="17" rx="2.5" className="fill-sidebar" opacity="0.35" />
      <rect x="13" y="11" width="13" height="17" rx="2.5" className="fill-sidebar" />
      <path d="M16.5 17h6M16.5 20.5h4" className="stroke-sidebar-primary" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
