import { isMock } from "@/lib/config";
import type { ApiAdapter } from "./adapter";
import { httpAdapter } from "./http";
import { mockAdapter } from "./mock";

// Components import `api` only. Mode is chosen once from VITE_API_MODE; no silent fallback.
export const api: ApiAdapter = isMock ? mockAdapter : httpAdapter;
export type { ApiAdapter } from "./adapter";
