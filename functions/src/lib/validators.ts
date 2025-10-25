import { z } from "zod";

export const CreateIncidentSchema = z.object({
  type: z.enum(["harassment", "theft", "suspicious", "medical", "other"]),
  text: z.string().min(5, "Text must be at least 5 characters long.").max(2000),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  severity: z.number().int().min(1).max(5),
});

export const CreateBuddySessionSchema = z.object({
  participants: z.array(z.string().min(1)).min(1, "At least one participant is required."),
  checkInIntervalSec: z.number().int().min(30).max(3600), // 30s to 1hr
});

export const CheckInSchema = z.object({
  status: z.enum(["ok", "help"]),
});