import * as admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || "";
  if (!hdr.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const idToken = hdr.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    // This is a temporary solution. We will fetch the user's role from Firestore later.
    (req as any).user = { uid: decoded.uid, role: 'user' }; 
    next();
  } catch (error) {
    console.error("Error verifying auth token:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}