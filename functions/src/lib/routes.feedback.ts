import express, { Request, Response } from "express";
import * as admin from "firebase-admin";
import { z } from "zod";
import { Feedback, FeedbackVote, FeedbackReport, AppRating } from "../types";

const router = express.Router();
const db = admin.firestore();

// Validation schemas
const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
  category: z.enum(["app", "feature", "safety", "support", "general"]),
  userName: z.string().min(1).max(100).optional(),
  isAnonymous: z.boolean().default(false),
  featureRatings: z
    .object({
      buddySystem: z.number().min(1).max(5).optional(),
      safeRoutes: z.number().min(1).max(5).optional(),
      incidentReporting: z.number().min(1).max(5).optional(),
      aiAssistant: z.number().min(1).max(5).optional(),
      alerts: z.number().min(1).max(5).optional(),
    })
    .optional(),
});

const voteSchema = z.object({
  feedbackId: z.string().min(1),
  vote: z.enum(["helpful", "not_helpful"]),
});

const reportSchema = z.object({
  feedbackId: z.string().min(1),
  reason: z.enum(["spam", "inappropriate", "offensive", "misleading", "other"]),
  description: z.string().max(500).optional(),
});

const appRatingSchema = z.object({
  overallRating: z.number().int().min(1).max(5),
  featureRatings: z.object({
    buddySystem: z.number().min(1).max(5),
    safeRoutes: z.number().min(1).max(5),
    incidentReporting: z.number().min(1).max(5),
    aiAssistant: z.number().min(1).max(5),
    alerts: z.number().min(1).max(5),
    userInterface: z.number().min(1).max(5),
    performance: z.number().min(1).max(5),
  }),
  wouldRecommend: z.boolean(),
  improvements: z.string().max(1000).optional(),
});

const adminResponseSchema = z.object({
  feedbackId: z.string().min(1),
  response: z.string().min(1).max(1000),
});

/**
 * POST /api/feedback
 * Submit new feedback/review
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const uid = req.body.uid || "anonymous";
    const parsed = feedbackSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid feedback data",
        details: parsed.error.errors,
      });
    }

    const feedbackData = parsed.data;

    // Check for profanity or inappropriate content (basic check)
    const inappropriateWords = ["spam", "test123"]; // Add more as needed
    const hasInappropriate = inappropriateWords.some((word) =>
      feedbackData.comment.toLowerCase().includes(word)
    );

    const feedback: Feedback = {
      id: db.collection("feedback").doc().id,
      uid: feedbackData.isAnonymous ? "anonymous" : uid,
      userName: feedbackData.userName,
      rating: feedbackData.rating as 1 | 2 | 3 | 4 | 5,
      comment: feedbackData.comment,
      category: feedbackData.category,
      featureRatings: feedbackData.featureRatings,
      createdAt: admin.firestore.Timestamp.now(),
      status: hasInappropriate ? "flagged" : "pending",
      isAnonymous: feedbackData.isAnonymous,
      helpful: 0,
      notHelpful: 0,
    };

    await db.collection("feedback").doc(feedback.id).set(feedback);

    // Update user's feedback count
    if (!feedbackData.isAnonymous) {
      await db
        .collection("users")
        .doc(uid)
        .set(
          {
            feedbackCount: admin.firestore.FieldValue.increment(1),
            lastFeedbackAt: feedback.createdAt,
          },
          { merge: true }
        );
    }

    res.json({
      success: true,
      feedbackId: feedback.id,
      status: feedback.status,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

/**
 * GET /api/feedback
 * Get all approved feedback (public)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      category,
      minRating,
      limit = "20",
      sortBy = "recent",
      page = "1",
    } = req.query;

    let query = db
      .collection("feedback")
      .where("status", "==", "approved") as admin.firestore.Query;

    if (category) {
      query = query.where("category", "==", category);
    }

    if (minRating) {
      query = query.where("rating", ">=", parseInt(minRating as string));
    }

    // Sort
    if (sortBy === "recent") {
      query = query.orderBy("createdAt", "desc");
    } else if (sortBy === "rating") {
      query = query.orderBy("rating", "desc");
    } else if (sortBy === "helpful") {
      query = query.orderBy("helpful", "desc");
    }

    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const offset = (pageNum - 1) * limitNum;

    query = query.limit(limitNum);

    const snapshot = await query.get();
    const feedbacks = snapshot.docs.slice(offset).map((doc) => {
      const data = doc.data() as Feedback;
      return {
        id: data.id,
        userName: data.isAnonymous ? "Anonymous" : data.userName || "User",
        rating: data.rating,
        comment: data.comment,
        category: data.category,
        featureRatings: data.featureRatings,
        createdAt: data.createdAt.toDate().toISOString(),
        helpful: data.helpful,
        notHelpful: data.notHelpful,
        adminResponse: data.adminResponse,
      };
    });

    // Get total count for pagination
    const countSnapshot = await db
      .collection("feedback")
      .where("status", "==", "approved")
      .count()
      .get();

    res.json({
      feedbacks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countSnapshot.data().count,
        totalPages: Math.ceil(countSnapshot.data().count / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

/**
 * GET /api/feedback/:id
 * Get specific feedback by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feedbackDoc = await db.collection("feedback").doc(id).get();

    if (!feedbackDoc.exists) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    const data = feedbackDoc.data() as Feedback;

    res.json({
      id: data.id,
      userName: data.isAnonymous ? "Anonymous" : data.userName || "User",
      rating: data.rating,
      comment: data.comment,
      category: data.category,
      featureRatings: data.featureRatings,
      createdAt: data.createdAt.toDate().toISOString(),
      helpful: data.helpful,
      notHelpful: data.notHelpful,
      adminResponse: data.adminResponse,
      adminResponseAt: data.adminResponseAt?.toDate().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

/**
 * POST /api/feedback/vote
 * Vote on feedback (helpful/not helpful)
 */
router.post("/vote", async (req: Request, res: Response) => {
  try {
    const uid = req.body.uid || "anonymous";
    const parsed = voteSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid vote data",
        details: parsed.error.errors,
      });
    }

    const { feedbackId, vote } = parsed.data;

    // Check if user already voted
    const existingVote = await db
      .collection("feedbackVotes")
      .where("feedbackId", "==", feedbackId)
      .where("uid", "==", uid)
      .get();

    if (!existingVote.empty) {
      return res.status(400).json({ error: "You have already voted on this feedback" });
    }

    // Create vote
    const voteData: FeedbackVote = {
      id: db.collection("feedbackVotes").doc().id,
      feedbackId,
      uid,
      vote,
      createdAt: admin.firestore.Timestamp.now(),
    };

    await db.collection("feedbackVotes").doc(voteData.id).set(voteData);

    // Update feedback vote counts
    const updateField = vote === "helpful" ? "helpful" : "notHelpful";
    await db
      .collection("feedback")
      .doc(feedbackId)
      .update({
        [updateField]: admin.firestore.FieldValue.increment(1),
      });

    res.json({
      success: true,
      voteId: voteData.id,
    });
  } catch (error) {
    console.error("Error voting on feedback:", error);
    res.status(500).json({ error: "Failed to vote on feedback" });
  }
});

/**
 * POST /api/feedback/report
 * Report inappropriate feedback
 */
router.post("/report", async (req: Request, res: Response) => {
  try {
    const uid = req.body.uid || "anonymous";
    const parsed = reportSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid report data",
        details: parsed.error.errors,
      });
    }

    const reportData = parsed.data;

    const report: FeedbackReport = {
      id: db.collection("feedbackReports").doc().id,
      feedbackId: reportData.feedbackId,
      reporterUid: uid,
      reason: reportData.reason,
      description: reportData.description,
      createdAt: admin.firestore.Timestamp.now(),
      status: "pending",
    };

    await db.collection("feedbackReports").doc(report.id).set(report);

    // Flag the feedback if multiple reports
    const reportsSnapshot = await db
      .collection("feedbackReports")
      .where("feedbackId", "==", reportData.feedbackId)
      .count()
      .get();

    if (reportsSnapshot.data().count >= 3) {
      await db.collection("feedback").doc(reportData.feedbackId).update({
        status: "flagged",
      });
    }

    res.json({
      success: true,
      reportId: report.id,
    });
  } catch (error) {
    console.error("Error reporting feedback:", error);
    res.status(500).json({ error: "Failed to report feedback" });
  }
});

/**
 * GET /api/feedback/stats
 * Get feedback statistics
 */
router.get("/stats/summary", async (req: Request, res: Response) => {
  try {
    // Get total feedback count
    const totalSnapshot = await db.collection("feedback").count().get();

    // Get approved feedback count
    const approvedSnapshot = await db
      .collection("feedback")
      .where("status", "==", "approved")
      .count()
      .get();

    // Get average rating
    const feedbackSnapshot = await db
      .collection("feedback")
      .where("status", "==", "approved")
      .get();

    let totalRating = 0;
    let ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let categoryCounts: Record<string, number> = {};

    feedbackSnapshot.docs.forEach((doc) => {
      const data = doc.data() as Feedback;
      totalRating += data.rating;
      ratingCounts[data.rating]++;
      categoryCounts[data.category] = (categoryCounts[data.category] || 0) + 1;
    });

    const averageRating =
      feedbackSnapshot.size > 0 ? totalRating / feedbackSnapshot.size : 0;

    res.json({
      total: totalSnapshot.data().count,
      approved: approvedSnapshot.data().count,
      averageRating: parseFloat(averageRating.toFixed(2)),
      ratingDistribution: ratingCounts,
      categoryDistribution: categoryCounts,
    });
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    res.status(500).json({ error: "Failed to fetch feedback stats" });
  }
});

/**
 * POST /api/feedback/app-rating
 * Submit detailed app rating
 */
router.post("/app-rating", async (req: Request, res: Response) => {
  try {
    const uid = req.body.uid || "anonymous";
    const parsed = appRatingSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid app rating data",
        details: parsed.error.errors,
      });
    }

    const ratingData = parsed.data;

    // Check if user already submitted a rating
    const existingRating = await db
      .collection("appRatings")
      .where("uid", "==", uid)
      .get();

    let ratingId: string;

    if (!existingRating.empty) {
      // Update existing rating
      ratingId = existingRating.docs[0].id;
      await db
        .collection("appRatings")
        .doc(ratingId)
        .update({
          ...ratingData,
          updatedAt: admin.firestore.Timestamp.now(),
        });
    } else {
      // Create new rating
      const rating: AppRating = {
        id: db.collection("appRatings").doc().id,
        uid,
        overallRating: ratingData.overallRating as 1 | 2 | 3 | 4 | 5,
        featureRatings: ratingData.featureRatings,
        wouldRecommend: ratingData.wouldRecommend,
        improvements: ratingData.improvements,
        createdAt: admin.firestore.Timestamp.now(),
      };

      ratingId = rating.id;
      await db.collection("appRatings").doc(rating.id).set(rating);
    }

    res.json({
      success: true,
      ratingId,
    });
  } catch (error) {
    console.error("Error submitting app rating:", error);
    res.status(500).json({ error: "Failed to submit app rating" });
  }
});

/**
 * GET /api/feedback/app-rating/stats
 * Get app rating statistics
 */
router.get("/app-rating/stats", async (req: Request, res: Response) => {
  try {
    const ratingsSnapshot = await db.collection("appRatings").get();

    if (ratingsSnapshot.empty) {
      return res.json({
        totalRatings: 0,
        averageOverallRating: 0,
        averageFeatureRatings: {},
        recommendationRate: 0,
      });
    }

    let totalOverallRating = 0;
    let featureTotals = {
      buddySystem: 0,
      safeRoutes: 0,
      incidentReporting: 0,
      aiAssistant: 0,
      alerts: 0,
      userInterface: 0,
      performance: 0,
    };
    let recommendCount = 0;

    ratingsSnapshot.docs.forEach((doc) => {
      const data = doc.data() as AppRating;
      totalOverallRating += data.overallRating;

      Object.keys(featureTotals).forEach((key) => {
        featureTotals[key as keyof typeof featureTotals] +=
          data.featureRatings[key as keyof typeof data.featureRatings];
      });

      if (data.wouldRecommend) recommendCount++;
    });

    const count = ratingsSnapshot.size;
    const averageFeatureRatings: Record<string, number> = {};

    Object.keys(featureTotals).forEach((key) => {
      averageFeatureRatings[key] = parseFloat(
        (featureTotals[key as keyof typeof featureTotals] / count).toFixed(2)
      );
    });

    res.json({
      totalRatings: count,
      averageOverallRating: parseFloat((totalOverallRating / count).toFixed(2)),
      averageFeatureRatings,
      recommendationRate: parseFloat(((recommendCount / count) * 100).toFixed(2)),
    });
  } catch (error) {
    console.error("Error fetching app rating stats:", error);
    res.status(500).json({ error: "Failed to fetch app rating stats" });
  }
});

/**
 * ADMIN ENDPOINTS
 */

/**
 * GET /api/feedback/admin/pending
 * Get all pending feedback for review (admin only)
 */
router.get("/admin/pending", async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication middleware
    const { limit = "50" } = req.query;

    const snapshot = await db
      .collection("feedback")
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .limit(parseInt(limit as string))
      .get();

    const feedbacks = snapshot.docs.map((doc) => {
      const data = doc.data() as Feedback;
      return {
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
      };
    });

    res.json({ feedbacks });
  } catch (error) {
    console.error("Error fetching pending feedback:", error);
    res.status(500).json({ error: "Failed to fetch pending feedback" });
  }
});

/**
 * PUT /api/feedback/admin/approve/:id
 * Approve feedback (admin only)
 */
router.put("/admin/approve/:id", async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication middleware
    const { id } = req.params;

    await db.collection("feedback").doc(id).update({
      status: "approved",
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error approving feedback:", error);
    res.status(500).json({ error: "Failed to approve feedback" });
  }
});

/**
 * PUT /api/feedback/admin/reject/:id
 * Reject feedback (admin only)
 */
router.put("/admin/reject/:id", async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication middleware
    const { id } = req.params;

    await db.collection("feedback").doc(id).update({
      status: "rejected",
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error rejecting feedback:", error);
    res.status(500).json({ error: "Failed to reject feedback" });
  }
});

/**
 * POST /api/feedback/admin/respond
 * Add admin response to feedback
 */
router.post("/admin/respond", async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication middleware
    const parsed = adminResponseSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid response data",
        details: parsed.error.errors,
      });
    }

    const { feedbackId, response } = parsed.data;

    await db
      .collection("feedback")
      .doc(feedbackId)
      .update({
        adminResponse: response,
        adminResponseAt: admin.firestore.Timestamp.now(),
      });

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding admin response:", error);
    res.status(500).json({ error: "Failed to add admin response" });
  }
});

export default router;