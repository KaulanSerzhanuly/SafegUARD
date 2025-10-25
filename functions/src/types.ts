import * as admin from "firebase-admin";

export interface Incident {
  id: string;
  reporterUid: string;
  type: "harassment" | "theft" | "suspicious" | "medical" | "other";
  text: string;
  location: {
    lat: number;
    lng: number;
  };
  severity: 1 | 2 | 3 | 4 | 5;
  createdAt: admin.firestore.Timestamp;
  status: "open" | "ack" | "closed";
  summary?: string;
}

export interface RiskSnapshot {
  id: string; // yyyymmddHH
  grid: {
    lat: number;
    lng: number;
    riskScore: number;
  }[];
}

export interface SafeRouteResponse {
  polyline: string; // For now, a simple string representation is fine
  rationale: string;
}

export interface BuddySession {
  id: string;
  ownerUid: string;
  participants: string[];
  active: boolean;
  createdAt: admin.firestore.Timestamp;
  lastCheckInAt?: admin.firestore.Timestamp;
  checkInIntervalSec: number;
}

export interface CheckIn {
  id: string;
  uid: string;
  timestamp: admin.firestore.Timestamp;
  status: "ok" | "help";
}

export interface Alert {
  id: string;
  triggeredByUid: string;
  type: "sos" | "fallthrough";
  payload: any;
  createdAt: admin.firestore.Timestamp;
  delivered: boolean;
}

export interface LocationUpdate {
  id: string;
  uid: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  timestamp: admin.firestore.Timestamp;
  sessionId?: string; // Optional buddy session ID
  speed?: number; // meters per second
  heading?: number; // degrees
}

export interface LocationHistory {
  uid: string;
  locations: LocationUpdate[];
  startTime: admin.firestore.Timestamp;
  endTime?: admin.firestore.Timestamp;
}

export interface ProximityAlert {
  id: string;
  uid: string;
  type: "incident" | "safe_zone" | "buddy";
  location: {
    lat: number;
    lng: number;
  };
  radius: number; // meters
  message: string;
  createdAt: admin.firestore.Timestamp;
  triggered: boolean;
}

export interface Feedback {
  id: string;
  uid: string;
  userName?: string; // Optional display name
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  category: "app" | "feature" | "safety" | "support" | "general";
  featureRatings?: {
    buddySystem?: number;
    safeRoutes?: number;
    incidentReporting?: number;
    aiAssistant?: number;
    alerts?: number;
  };
  createdAt: admin.firestore.Timestamp;
  status: "pending" | "approved" | "rejected" | "flagged";
  isAnonymous: boolean;
  helpful: number; // Count of helpful votes
  notHelpful: number; // Count of not helpful votes
  adminResponse?: string;
  adminResponseAt?: admin.firestore.Timestamp;
}

export interface FeedbackVote {
  id: string;
  feedbackId: string;
  uid: string;
  vote: "helpful" | "not_helpful";
  createdAt: admin.firestore.Timestamp;
}

export interface FeedbackReport {
  id: string;
  feedbackId: string;
  reporterUid: string;
  reason: "spam" | "inappropriate" | "offensive" | "misleading" | "other";
  description?: string;
  createdAt: admin.firestore.Timestamp;
  status: "pending" | "reviewed" | "resolved";
}

export interface AppRating {
  id: string;
  uid: string;
  overallRating: 1 | 2 | 3 | 4 | 5;
  featureRatings: {
    buddySystem: number;
    safeRoutes: number;
    incidentReporting: number;
    aiAssistant: number;
    alerts: number;
    userInterface: number;
    performance: number;
  };
  wouldRecommend: boolean;
  improvements?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}