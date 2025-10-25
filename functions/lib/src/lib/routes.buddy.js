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
const router = (0, express_1.Router)();
const db = admin.firestore();
// POST /api/buddy/sessions - Create a new buddy session
router.post("/sessions", auth_1.authMiddleware, async (req, res) => {
    const validation = validators_1.CreateBuddySessionSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
    }
    const user = req.user;
    const { participants, checkInIntervalSec } = validation.data;
    // Ensure the owner is in the participants list
    if (!participants.includes(user.uid)) {
        participants.push(user.uid);
    }
    const newSession = {
        ownerUid: user.uid,
        participants,
        checkInIntervalSec,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection("buddy_sessions").add(newSession);
    res.status(201).json({ id: docRef.id });
});
// POST /api/buddy/:id/checkin - Check in to a session
router.post("/:id/checkin", auth_1.authMiddleware, async (req, res) => {
    const validation = validators_1.CheckInSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
    }
    const user = req.user;
    const sessionId = req.params.id;
    const { status } = validation.data;
    const sessionRef = db.collection("buddy_sessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists || !sessionDoc.data().participants.includes(user.uid)) {
        return res.status(403).json({ error: "You are not part of this session." });
    }
    const checkInData = {
        uid: user.uid,
        status,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    await sessionRef.collection("checkins").add(checkInData);
    await sessionRef.update({ lastCheckInAt: admin.firestore.FieldValue.serverTimestamp() });
    res.status(200).json({ ok: true });
});
exports.default = router;
//# sourceMappingURL=routes.buddy.js.map