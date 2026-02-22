import { createApp } from "./app.js";
import { env } from "./config/env.js";

const isAzure =
  Boolean(process.env.WEBSITE_SITE_NAME) ||
  Boolean(process.env.WEBSITE_INSTANCE_ID) ||
  Boolean(process.env.WEBSITE_HOSTNAME);

function start() {
  const app = createApp();

  app.listen(env.port, env.host, () => {
    const publicHost = process.env.WEBSITE_HOSTNAME ? `https://${process.env.WEBSITE_HOSTNAME}` : `http://${env.host}:${env.port}`;
  });
}

start();
