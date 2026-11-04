// Public frontend config only. Never put secrets here.
export type ApiMode = "mock" | "api";

const rawMode = (import.meta.env["VITE_API_MODE"] as string | undefined)?.toLowerCase();

export const config = {
  mode: (rawMode === "api" ? "api" : "mock") as ApiMode,
  apiBaseUrl: ((import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:8000").replace(/\/$/, ""),
};

export const isMock = config.mode === "mock";
