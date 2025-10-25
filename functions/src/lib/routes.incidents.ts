import { Router } from "express";
import * as admin from "firebase-admin";
import { authMiddleware } from "../middleware/auth";
import { CreateIncidentSchema } from "./validators";
import { summarize } from "./llm"; // Import the new summarize function

const router = Router();

// POST /api/incidents - Create a new incident
router.post("/", authMiddleware, async (req, res) => {
  try {
    const validation = CreateIncidentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.flatten() });
    }

    const { type, text, location, severity } = validation.data;
    const user = (req as any).user;

    // Generate AI summary
    const summary = await summarize(text);

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
  } catch (error) {
    console.error("Error creating incident:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// GET /api/incidents - List incidents
router.get("/", authMiddleware, async (req, res) => {
  // This is a simplified implementation.
  // A full implementation would handle role-based access (admins see all, users see their own).
  const incidents = await admin.firestore().collection("incidents").limit(20).get();
  const data = incidents.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json(data);
});

export default router;