"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronRecomputeRisk = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// This is a simplified risk scoring implementation.
// A real-world version would use a more sophisticated grid system.
exports.cronRecomputeRisk = functions.pubsub.schedule("every 10 minutes").onRun(async (context) => {
    console.log("Recomputing risk snapshots...");
    const db = admin.firestore();
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const recentIncidents = await db.collection("incidents")
        .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(sixHoursAgo))
        .get();
    if (recentIncidents.empty) {
        console.log("No recent incidents found.");
        return null;
    }
    // For this stub, we'll just use the incident locations as our "grid".
    const riskGrid = recentIncidents.docs.map(doc => {
        const incident = doc.data();
        const minutesOld = (Date.now() - incident.createdAt.toDate().getTime()) / (1000 * 60);
        const riskScore = incident.severity * Math.exp(-minutesOld / 120);
        return {
            lat: incident.location.lat,
            lng: incident.location.lng,
            riskScore: Math.round(riskScore * 100) / 100, // Round to 2 decimal places
        };
    });
    const snapshotId = new Date().toISOString().slice(0, 13).replace(/[-T:]/g, ""); // yyyymmddHH
    await db.collection("risk_snapshots").doc(snapshotId).set({ grid: riskGrid });
    console.log(`Successfully created risk snapshot ${snapshotId} with ${riskGrid.length} data points.`);
    return null;
});
//# sourceMappingURL=risk.js.map