export const isAzure =
  Boolean(process.env.WEBSITE_SITE_NAME) ||
  Boolean(process.env.WEBSITE_INSTANCE_ID) ||
  Boolean(process.env.WEBSITE_HOSTNAME);

export function parsePort(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
