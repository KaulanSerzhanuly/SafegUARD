import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import app from "./app";

admin.initializeApp();
export const api = functions.region("us-central1").https.onRequest(app);
export { cronRecomputeRisk } from "./lib/risk";