import { Router } from "express";
import * as admin from "firebase-admin";
import { authMiddleware } from "../middleware/auth";
import { CreateBuddySessionSchema, CheckInSchema } from "./validators";

const router = Router();
const db = admin.firestore();

// POST /api/buddy/sessions - Create a new buddy session
router.post("/sessions", authMiddleware, async (req, res) => {
  const validation = CreateBuddySessionSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.flatten() });
  }

  const user = (req as any).user;
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
router.post("/:id/checkin", authMiddleware, async (req, res) => {
  const validation = CheckInSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.flatten() });
  }

  const user = (req as any).user;
  const sessionId = req.params.id;
  const { status } = validation.data;

  const sessionRef = db.collection("buddy_sessions").doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists || !sessionDoc.data()!.participants.includes(user.uid)) {
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

export default router;