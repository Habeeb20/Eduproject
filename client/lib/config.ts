// src/lib/config.ts

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:2020/api', // fallback only in dev
} as const;

// Optional: still warn in development
if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    '⚠️  NEXT_PUBLIC_API_URL is not set in .env.local — using fallback URL'
  );
}