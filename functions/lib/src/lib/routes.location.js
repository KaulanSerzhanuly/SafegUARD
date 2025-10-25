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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const router = express_1.default.Router();
const db = admin.firestore();
// Validation schemas
const locationUpdateSchema = zod_1.z.object({
    lat: zod_1.z.number().min(-90).max(90),
    lng: zod_1.z.number().min(-180).max(180),
    accuracy: zod_1.z.number().optional(),
    speed: zod_1.z.number().optional(),
    heading: zod_1.z.number().min(0).max(360).optional(),
    sessionId: zod_1.z.string().optional(),
});
const proximityAlertSchema = zod_1.z.object({
    type: zod_1.z.enum(["incident", "safe_zone", "buddy"]),
    lat: zod_1.z.number().min(-90).max(90),
    lng: zod_1.z.number().min(-180).max(180),
    radius: zod_1.z.number().min(1).max(5000), // 1m to 5km
    message: zod_1.z.string().min(1).max(500),
});
// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
}
/**
 * POST /api/location/update
 * Update user's current location
 */
router.post("/update", async (req, res) => {
    try {
        const uid = req.body.uid || "anonymous"; // In production, get from auth token
        const parsed = locationUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid location data",
                details: parsed.error.errors,
            });
        }
        const locationData = parsed.data;
        const locationUpdate = {
            id: db.collection("locations").doc().id,
            uid,
            location: {
                lat: locationData.lat,
                lng: locationData.lng,
                accuracy: locationData.accuracy,
            },
            timestamp: admin.firestore.Timestamp.now(),
            sessionId: locationData.sessionId,
            speed: locationData.speed,
            heading: locationData.heading,
        };
        // Save location update
        await db.collection("locations").doc(locationUpdate.id).set(locationUpdate);
        // Update user's current location
        await db
            .collection("users")
            .doc(uid)
            .set({
            currentLocation: locationUpdate.location,
            lastLocationUpdate: locationUpdate.timestamp,
        }, { merge: true });
        // If part of a buddy session, update session location
        if (locationData.sessionId) {
            await db
                .collection("buddySessions")
                .doc(locationData.sessionId)
                .collection("locations")
                .doc(uid)
                .set({
                location: locationUpdate.location,
                timestamp: locationUpdate.timestamp,
                uid,
            });
        }
        // Check for proximity alerts
        const alerts = await checkProximityAlerts(uid, locationData.lat, locationData.lng);
        res.json({
            success: true,
            locationId: locationUpdate.id,
            alerts: alerts.length > 0 ? alerts : undefined,
        });
    }
    catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({ error: "Failed to update location" });
    }
});
/**
 * GET /api/location/current/:uid
 * Get user's current location
 */
router.get("/current/:uid", async (req, res) => {
    var _a;
    try {
        const { uid } = req.params;
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }
        const userData = userDoc.data();
        if (!(userData === null || userData === void 0 ? void 0 : userData.currentLocation)) {
            return res.status(404).json({ error: "No location data available" });
        }
        res.json({
            uid,
            location: userData.currentLocation,
            lastUpdate: (_a = userData.lastLocationUpdate) === null || _a === void 0 ? void 0 : _a.toDate().toISOString(),
        });
    }
    catch (error) {
        console.error("Error fetching current location:", error);
        res.status(500).json({ error: "Failed to fetch location" });
    }
});
/**
 * GET /api/location/history/:uid
 * Get user's location history
 */
router.get("/history/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const { startTime, endTime, limit = "100" } = req.query;
        let query = db
            .collection("locations")
            .where("uid", "==", uid)
            .orderBy("timestamp", "desc")
            .limit(parseInt(limit));
        if (startTime) {
            query = query.where("timestamp", ">=", admin.firestore.Timestamp.fromDate(new Date(startTime)));
        }
        if (endTime) {
            query = query.where("timestamp", "<=", admin.firestore.Timestamp.fromDate(new Date(endTime)));
        }
        const snapshot = await query.get();
        const locations = snapshot.docs.map((doc) => {
            const data = doc.data();
            return Object.assign(Object.assign({}, data), { timestamp: data.timestamp.toDate().toISOString() });
        });
        res.json({
            uid,
            count: locations.length,
            locations,
        });
    }
    catch (error) {
        console.error("Error fetching location history:", error);
        res.status(500).json({ error: "Failed to fetch location history" });
    }
});
/**
 * GET /api/location/session/:sessionId
 * Get all locations for a buddy session
 */
router.get("/session/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Get session details
        const sessionDoc = await db.collection("buddySessions").doc(sessionId).get();
        if (!sessionDoc.exists) {
            return res.status(404).json({ error: "Session not found" });
        }
        // Get all participant locations
        const locationsSnapshot = await db
            .collection("buddySessions")
            .doc(sessionId)
            .collection("locations")
            .get();
        const participantLocations = locationsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                uid: data.uid,
                location: data.location,
                timestamp: data.timestamp.toDate().toISOString(),
            };
        });
        res.json({
            sessionId,
            participants: participantLocations,
        });
    }
    catch (error) {
        console.error("Error fetching session locations:", error);
        res.status(500).json({ error: "Failed to fetch session locations" });
    }
});
/**
 * POST /api/location/proximity-alert
 * Create a proximity alert
 */
router.post("/proximity-alert", async (req, res) => {
    try {
        const uid = req.body.uid || "anonymous";
        const parsed = proximityAlertSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid proximity alert data",
                details: parsed.error.errors,
            });
        }
        const alertData = parsed.data;
        const alert = {
            id: db.collection("proximityAlerts").doc().id,
            uid,
            type: alertData.type,
            location: {
                lat: alertData.lat,
                lng: alertData.lng,
            },
            radius: alertData.radius,
            message: alertData.message,
            createdAt: admin.firestore.Timestamp.now(),
            triggered: false,
        };
        await db.collection("proximityAlerts").doc(alert.id).set(alert);
        res.json({
            success: true,
            alertId: alert.id,
        });
    }
    catch (error) {
        console.error("Error creating proximity alert:", error);
        res.status(500).json({ error: "Failed to create proximity alert" });
    }
});
/**
 * GET /api/location/nearby
 * Get nearby users (for buddy system)
 */
router.get("/nearby", async (req, res) => {
    try {
        const { lat, lng, radius = "1000" } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ error: "Latitude and longitude required" });
        }
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const searchRadius = parseInt(radius);
        // Get all users with recent location updates (within last 5 minutes)
        const fiveMinutesAgo = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000));
        const usersSnapshot = await db
            .collection("users")
            .where("lastLocationUpdate", ">=", fiveMinutesAgo)
            .get();
        const nearbyUsers = usersSnapshot.docs
            .map((doc) => {
            const data = doc.data();
            if (!data.currentLocation)
                return null;
            const distance = calculateDistance(userLat, userLng, data.currentLocation.lat, data.currentLocation.lng);
            if (distance <= searchRadius) {
                return {
                    uid: doc.id,
                    location: data.currentLocation,
                    distance: Math.round(distance),
                    lastUpdate: data.lastLocationUpdate.toDate().toISOString(),
                };
            }
            return null;
        })
            .filter((user) => user !== null);
        res.json({
            count: nearbyUsers.length,
            radius: searchRadius,
            users: nearbyUsers,
        });
    }
    catch (error) {
        console.error("Error finding nearby users:", error);
        res.status(500).json({ error: "Failed to find nearby users" });
    }
});
/**
 * DELETE /api/location/history/:uid
 * Clear user's location history
 */
router.delete("/history/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        // Delete all location records for user
        const locationsSnapshot = await db
            .collection("locations")
            .where("uid", "==", uid)
            .get();
        const batch = db.batch();
        locationsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        res.json({
            success: true,
            deletedCount: locationsSnapshot.size,
        });
    }
    catch (error) {
        console.error("Error clearing location history:", error);
        res.status(500).json({ error: "Failed to clear location history" });
    }
});
// Helper function to check proximity alerts
async function checkProximityAlerts(uid, lat, lng) {
    try {
        const alertsSnapshot = await db
            .collection("proximityAlerts")
            .where("uid", "==", uid)
            .where("triggered", "==", false)
            .get();
        const triggeredAlerts = [];
        for (const doc of alertsSnapshot.docs) {
            const alert = doc.data();
            const distance = calculateDistance(lat, lng, alert.location.lat, alert.location.lng);
            if (distance <= alert.radius) {
                // Mark alert as triggered
                await db.collection("proximityAlerts").doc(doc.id).update({
                    triggered: true,
                });
                triggeredAlerts.push({
                    id: doc.id,
                    type: alert.type,
                    message: alert.message,
                    distance: Math.round(distance),
                });
            }
        }
        return triggeredAlerts;
    }
    catch (error) {
        console.error("Error checking proximity alerts:", error);
        return [];
    }
}
exports.default = router;
//# sourceMappingURL=routes.location.js.map