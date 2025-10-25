"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_incidents_1 = __importDefault(require("./lib/routes.incidents"));
const routes_risk_1 = __importDefault(require("./lib/routes.risk"));
const routes_routes_1 = __importDefault(require("./lib/routes.routes"));
const routes_buddy_1 = __importDefault(require("./lib/routes.buddy"));
const routes_alerts_1 = __importDefault(require("./lib/routes.alerts"));
const routes_location_1 = __importDefault(require("./lib/routes.location"));
const app = (0, express_1.default)();
app.use(express_1.default.json()); // Add JSON body parser
app.get("/", (req, res) => {
    res.send("Welcome to the CampusSafe API!");
});
// Mount the routers
app.use("/api/incidents", routes_incidents_1.default);
app.use("/api/risk", routes_risk_1.default);
app.use("/api/safe-routes", routes_routes_1.default);
app.use("/api/buddy", routes_buddy_1.default);
app.use("/api/alerts", routes_alerts_1.default);
app.use("/api/location", routes_location_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map