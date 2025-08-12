import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    // Personal health information
    age: v.optional(v.number()),
    weight: v.optional(v.number()), // in kg
    height: v.optional(v.number()), // in cm
    bmi: v.optional(v.number()),
    bloodType: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    chronicConditions: v.optional(v.array(v.string())),
    medications: v.optional(v.array(v.string())),
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  chatHistory: defineTable({
    userId: v.optional(v.string()), // Optional for guest users
    sessionId: v.string(), // Unique session identifier
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
    })),
    type: v.union(v.literal("symptom-analysis"), v.literal("general-inquiry"), v.literal("report-analyzer"), v.literal("drug-information")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_session_id", ["sessionId"])
    .index("by_type", ["type"]),

  healthHistory: defineTable({
    userId: v.string(),
    type: v.union(v.literal("symptom"), v.literal("diagnosis"), v.literal("medication"), v.literal("report")),
    title: v.string(),
    description: v.string(),
    data: v.any(), // Flexible data structure
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_type", ["type"])
    .index("by_created_at", ["createdAt"]),

  userSessions: defineTable({
    sessionId: v.string(),
    userId: v.optional(v.string()),
    isGuest: v.boolean(),
    lastActivity: v.number(),
    createdAt: v.number(),
  })
    .index("by_session_id", ["sessionId"])
    .index("by_user_id", ["userId"])
    .index("by_last_activity", ["lastActivity"]),
});
