import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import yextSSG from "@yext/pages/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "local-form-submission",
      configureServer(server) {
        server.middlewares.use("/forms/submit", async (request, response) => {
          if (request.method !== "POST") {
            response.writeHead(405).end();
            return;
          }
          try {
            let submission = request.body;
            if (!submission) {
              let body = "";
              for await (const chunk of request) {
                body += chunk;
              }
              submission = JSON.parse(body);
            }
            const data = submission.data;
            const valid =
              request.headers["content-type"]?.includes("application/json") &&
              typeof submission.entity_id === "string" &&
              submission.entity_id.trim() &&
              typeof submission.token === "string" &&
              submission.token &&
              ["HS_CONTACT", "HS_EVENT"].includes(submission.type) &&
              typeof data?.first_name === "string" &&
              data.first_name.trim() &&
              typeof data?.last_name === "string" &&
              data.last_name.trim() &&
              ["EMAIL", "PHONE"].includes(data?.preferred_contact_method) &&
              typeof data?.[data.preferred_contact_method.toLowerCase()] ===
                "string" &&
              data[data.preferred_contact_method.toLowerCase()].trim();
            // Enter "Fail" as the first name to test the inline error state.
            response.writeHead(
              !valid ? 400 : data.first_name === "Fail" ? 500 : 200,
              {
                "Content-Type": "application/json",
              },
            );
            response.end(
              JSON.stringify({
                success: Boolean(valid) && data.first_name !== "Fail",
              }),
            );
          } catch {
            response.writeHead(400).end();
          }
        });
      },
    },
    yextSSG(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
    },
  },
  build: {
    target: "es2022",
  },
});
