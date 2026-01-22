// src/lib/config.ts    or   src/constants/env.ts

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:2020/api", // fallback for safety
} as const;