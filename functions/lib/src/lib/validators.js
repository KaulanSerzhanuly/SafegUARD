"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckInSchema = exports.CreateBuddySessionSchema = exports.CreateIncidentSchema = void 0;
const zod_1 = require("zod");
exports.CreateIncidentSchema = zod_1.z.object({
    type: zod_1.z.enum(["harassment", "theft", "suspicious", "medical", "other"]),
    text: zod_1.z.string().min(5, "Text must be at least 5 characters long.").max(2000),
    location: zod_1.z.object({
        lat: zod_1.z.number().min(-90).max(90),
        lng: zod_1.z.number().min(-180).max(180),
    }),
    severity: zod_1.z.number().int().min(1).max(5),
});
exports.CreateBuddySessionSchema = zod_1.z.object({
    participants: zod_1.z.array(zod_1.z.string().min(1)).min(1, "At least one participant is required."),
    checkInIntervalSec: zod_1.z.number().int().min(30).max(3600), // 30s to 1hr
});
exports.CheckInSchema = zod_1.z.object({
    status: zod_1.z.enum(["ok", "help"]),
});
//# sourceMappingURL=validators.js.map