import { createApp } from "./app.js";
import { env } from "./config/env.js";

function start() {
  const app = createApp();

  app.listen(env.port, env.host, () => {
    const port = env.port;
    const localUrl = `http://localhost:${port}`;
    const publicUrl = process.env.WEBSITE_HOSTNAME ? `https://${process.env.WEBSITE_HOSTNAME}` : null;

    console.log("");
    console.log("Server ready");
    console.log(`- Local:         ${localUrl}`);
    if (publicUrl) {
      console.log(`- Public:        ${publicUrl}`);
    }

    console.log("");
  });
}

start();