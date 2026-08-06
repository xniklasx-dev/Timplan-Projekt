import { createApp } from "./app.js";
import { env } from "./config/env.js";

function start() {
  const app = createApp();

  app.listen(env.port, () => {
    const port = env.port;
    const localUrl = `http://localhost:${port}`;

    if (env.nodeEnv === "production") {
      console.log("");
      console.log("Server ready");
    }
    else {
      console.log("");
      console.log("Server ready");
      console.log(`- Local:         ${localUrl}`);
    }
    
  });
}

start();