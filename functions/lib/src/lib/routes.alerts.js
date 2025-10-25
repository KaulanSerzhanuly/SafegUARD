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
const sms_1 = require("./sms");
const email_1 = require("./email");
const router = (0, express_1.Router)();
const db = admin.firestore();
// POST /api/alerts/sos - Trigger an SOS alert
router.post("/sos", auth_1.authMiddleware, async (req, res) => {
    const user = req.user;
    const newAlert = {
        triggeredByUid: user.uid,
        type: "sos",
        payload: req.body || {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        delivered: false, // Will be updated by a separate worker/function
    };
    const docRef = await db.collection("alerts").add(newAlert);
    // Fan-out to notification providers
    // In a real app, you'd fetch contact info for dispatchers/admins.
    const dispatchContacts = [{ email: "dispatcher@example.com", phone: "+15551234567" }];
    for (const contact of dispatchContacts) {
        await sms_1.smsProvider.send(contact.phone, `SOS from user ${user.uid}. Details in alert ${docRef.id}.`);
        await email_1.emailProvider.send(contact.email, `SOS Alert: ${docRef.id}`, `SOS triggered by user ${user.uid}.`);
    }
    res.status(202).json({ id: docRef.id, message: "SOS signal received and dispatched." });
});
exports.default = router;
//# sourceMappingURL=routes.alerts.js.map