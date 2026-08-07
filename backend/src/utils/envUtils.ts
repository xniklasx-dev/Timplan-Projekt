export const isAzure =
  Boolean(process.env.WEBSITE_SITE_NAME) ||
  Boolean(process.env.WEBSITE_INSTANCE_ID) ||
  Boolean(process.env.WEBSITE_HOSTNAME);