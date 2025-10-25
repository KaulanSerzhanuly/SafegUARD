import express, { Request, Response } from "express";
import incidentsRouter from "./lib/routes.incidents";
import riskRouter from "./lib/routes.risk";
import routesRouter from "./lib/routes.routes";
import buddyRouter from "./lib/routes.buddy";
import alertsRouter from "./lib/routes.alerts";
import locationRouter from "./lib/routes.location";
import feedbackRouter from "./lib/routes.feedback";

const app = express();
app.use(express.json()); // Add JSON body parser

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the CampusSafe API!");
});

// Mount the routers
app.use("/api/incidents", incidentsRouter);
app.use("/api/risk", riskRouter);
app.use("/api/safe-routes", routesRouter);
app.use("/api/buddy", buddyRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/location", locationRouter);
app.use("/api/feedback", feedbackRouter);

export default app;