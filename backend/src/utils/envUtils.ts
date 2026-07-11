const allowedDataSources = ["memory", "postgres"] as const;
export const isAzure =
    Boolean(process.env.WEBSITE_SITE_NAME) ||
    Boolean(process.env.WEBSITE_INSTANCE_ID) ||
    Boolean(process.env.WEBSITE_HOSTNAME);

export type DataSource = (typeof allowedDataSources)[number];

export function parseList(raw: string | undefined): string[] {
  return (raw ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
}

export function parsePort(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function parseDataSource(value: string | undefined): DataSource {
  if (!value) {
    return "memory";
  }

  if (isDataSource(value)) {
    return value;
  }

  throw new Error(
      `Invalid DATA_SOURCE "${value}". Use "memory" or "postgres".`,
  );
}

function isDataSource(value: string): value is DataSource {
  return allowedDataSources.includes(value as DataSource);
}