// ---------------------------------------------------------------------------
// Centralised configuration — all env-var reads happen here.
// ---------------------------------------------------------------------------

/** Origins permitted for CORS. Override via CORS_ORIGINS (comma-separated). */
export const ALLOWED_ORIGINS: string[] = (
  process.env.CORS_ORIGINS ??
  'http://localhost:5173,http://localhost:5174,http://localhost:5175'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const PORT = Number(process.env.PORT) || 5000;
