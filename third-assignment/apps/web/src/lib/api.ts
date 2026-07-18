import { hc } from "hono/client";
import type { AppType } from "@third-assignment/api";
import { env } from "@/env";

export const api = hc<AppType>(env.VITE_API_URL);
