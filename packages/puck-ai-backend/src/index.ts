import { Hono } from "hono";
import { corsForPuck } from "./cors";
import { puckRouter } from "./puckRouter";

const app = new Hono();

app.get("/", (c) => c.text("Yext Pages Puck AI Backend is running."));

app.use("/api/puck/*", corsForPuck);
app.post("/api/puck/:route", puckRouter);

export default app;
