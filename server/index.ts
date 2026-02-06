import express from "express";
import { createServer } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  await setupAuth(app);
  registerAuthRoutes(app);

  const server = createServer(app);

  if (process.env.NODE_ENV === "production") {
    const { serveStatic } = await import("./vite");
    await serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  }

  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
})();
