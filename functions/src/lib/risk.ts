import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// This is a simplified risk scoring implementation.
// A real-world version would use a more sophisticated grid system.
export const cronRecomputeRisk = functions.pubsub.schedule("every 10 minutes").onRun(async (context) => {
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