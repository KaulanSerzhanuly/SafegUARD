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
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/risk/near?lat=...&lng=...
router.get("/near", auth_1.authMiddleware, async (req, res) => {
    // For now, we'll return the highest risk score from the latest snapshot.
    // A real implementation would calculate distance and find the nearest grid cell.
    const latestSnapshot = await admin.firestore().collection("risk_snapshots").orderBy('__name__', 'desc').limit(1).get();
    if (latestSnapshot.empty) {
        return res.json({ riskScore: 0, nearbyIncidents: [] });
    }
    const snapshotData = latestSnapshot.docs[0].data();
    const maxRisk = snapshotData.grid.reduce((max, cell) => Math.max(max, cell.riskScore), 0);
    res.json({ riskScore: maxRisk, nearbyIncidents: snapshotData.grid });
});
exports.default = router;
//# sourceMappingURL=routes.risk.js.map