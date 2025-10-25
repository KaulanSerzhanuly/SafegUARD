import { Router } from "express";
import * as admin from "firebase-admin";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/risk/near?lat=...&lng=...
router.get("/near", authMiddleware, async (req, res) => {
  // For now, we'll return the highest risk score from the latest snapshot.
  // A real implementation would calculate distance and find the nearest grid cell.
  const latestSnapshot = await admin.firestore().collection("risk_snapshots").orderBy('__name__', 'desc').limit(1).get();
  if (latestSnapshot.empty) {
    return res.json({ riskScore: 0, nearbyIncidents: [] });
  }
  const snapshotData = latestSnapshot.docs[0].data();
  const maxRisk = snapshotData.grid.reduce((max: number, cell: any) => Math.max(max, cell.riskScore), 0);
  
  res.json({ riskScore: maxRisk, nearbyIncidents: snapshotData.grid });
});

export default router;