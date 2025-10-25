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
const validators_1 = require("./validators");
const llm_1 = require("./llm"); // Import the new summarize function
const router = (0, express_1.Router)();
// POST /api/incidents - Create a new incident
router.post("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const validation = validators_1.CreateIncidentSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }
        const { type, text, location, severity } = validation.data;
        const user = req.user;
        // Generate AI summary
        const summary = await (0, llm_1.summarize)(text);
        const newIncident = {
            reporterUid: user.uid,
            type,
            text,
            location,
            severity,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "open",
            summary, // Add the summary to the incident
        };
        const docRef = await admin.firestore().collection("incidents").add(newIncident);
        res.status(201).json({ id: docRef.id });
    }
    catch (error) {
        console.error("Error creating incident:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
});
// GET /api/incidents - List incidents
router.get("/", auth_1.authMiddleware, async (req, res) => {
    // This is a simplified implementation.
    // A full implementation would handle role-based access (admins see all, users see their own).
    const incidents = await admin.firestore().collection("incidents").limit(20).get();
    const data = incidents.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    res.status(200).json(data);
});
exports.default = router;
//# sourceMappingURL=routes.incidents.js.map