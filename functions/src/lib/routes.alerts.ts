import { Router } from "express";
import * as admin from "firebase-admin";
import { authMiddleware } from "../middleware/auth";
import { smsProvider } from "./sms";
import { emailProvider } from "./email";

const router = Router();
const db = admin.firestore();

// POST /api/alerts/sos - Trigger an SOS alert
router.post("/sos", authMiddleware, async (req, res) => {
  const user = (req as any).user;

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
    await smsProvider.send(contact.phone, `SOS from user ${user.uid}. Details in alert ${docRef.id}.`);
    await emailProvider.send(contact.email, `SOS Alert: ${docRef.id}`, `SOS triggered by user ${user.uid}.`);
  }

  res.status(202).json({ id: docRef.id, message: "SOS signal received and dispatched." });
});

export default router;