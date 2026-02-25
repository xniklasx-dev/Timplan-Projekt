import os from "os";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const isAzure =
  Boolean(process.env.WEBSITE_SITE_NAME) ||
  Boolean(process.env.WEBSITE_INSTANCE_ID) ||
  Boolean(process.env.WEBSITE_HOSTNAME);

function start() {
  const app = createApp();

  app.listen(env.port, env.host, () => {
    const port = env.port;

    const localUrl = `http://localhost:${port}`;

    const networkInterfaces = os.networkInterfaces();
    let networkUrl: string | null = null;

    for (const name of Object.keys(networkInterfaces)) {
      const networkInterface = networkInterfaces[name];
      if (!networkInterface) continue;

      for (const interfaceDetails of networkInterface) {
        if (interfaceDetails.family === "IPv4" && !interfaceDetails.internal) {
          networkUrl = `http://${interfaceDetails.address}:${port}`;
          break;
        }
      }
      if (networkUrl) break;
    }

    const publicUrl = process.env.WEBSITE_HOSTNAME
      ? `https://${process.env.WEBSITE_HOSTNAME}`
      : null;

    console.log("");
    console.log("▲ Server ready");

    if (!isAzure) {
      console.log(`- Local:         ${localUrl}`);
      if (networkUrl) {
        console.log(`- Network:       ${networkUrl}`);
      }
    }

    if (publicUrl) {
      console.log(`- Public:        ${publicUrl}`);
    }

    console.log("");
  });
}

start();