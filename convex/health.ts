import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addHealthRecord = mutation({
  args: {
    userId: v.string(),
    type: v.union(v.literal("symptom"), v.literal("diagnosis"), v.literal("medication"), v.literal("report")),
    title: v.string(),
    description: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const healthId = await ctx.db.insert("healthHistory", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      description: args.description,
      data: args.data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return healthId;
  },
});

export const updateHealthRecord = mutation({
  args: {
    recordId: v.id("healthHistory"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      data: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.recordId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return args.recordId;
  },
});

export const deleteHealthRecord = mutation({
  args: { recordId: v.id("healthHistory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.recordId);
    return args.recordId;
  },
});

export const getUserHealthHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("healthHistory")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getHealthHistoryByType = query({
  args: { 
    userId: v.string(),
    type: v.union(v.literal("symptom"), v.literal("diagnosis"), v.literal("medication"), v.literal("report"))
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("healthHistory")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .collect();
  },
});

export const getRecentHealthHistory = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    return await ctx.db
      .query("healthHistory")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const extractHealthInsightsFromChat = mutation({
  args: {
    chatId: v.id("chatHistory"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the chat history
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== args.userId) {
      throw new Error("Chat not found or access denied");
    }

    // Extract health-related information from the conversation
    const healthInsights = [];
    
    // Look for symptoms mentioned in the conversation
    for (const message of chat.messages) {
      const content = message.content.toLowerCase();
      
      // Check for symptoms
      const symptomKeywords = ['pain', 'fever', 'headache', 'nausea', 'fatigue', 'cough', 'cold', 'flu', 'sore throat', 'stomach ache', 'dizziness', 'chest pain', 'shortness of breath'];
      const foundSymptoms = symptomKeywords.filter(symptom => content.includes(symptom));
      
      if (foundSymptoms.length > 0 && message.role === 'user') {
        healthInsights.push({
          type: 'symptom' as const,
          title: `Symptoms reported on ${new Date(message.timestamp).toLocaleDateString()}`,
          description: `User reported: ${foundSymptoms.join(', ')}. Full message: ${message.content}`,
          data: {
            symptoms: foundSymptoms,
            originalMessage: message.content,
            timestamp: message.timestamp,
            chatType: chat.type,
          }
        });
      }
      
      // Check for medications mentioned
      const medicationKeywords = ['medicine', 'medication', 'pill', 'tablet', 'prescription', 'drug', 'taking', 'prescribed'];
      const hasMedication = medicationKeywords.some(med => content.includes(med));
      
      if (hasMedication && message.role === 'user' && content.length > 20) {
        healthInsights.push({
          type: 'medication' as const,
          title: `Medication discussion on ${new Date(message.timestamp).toLocaleDateString()}`,
          description: `Medication-related discussion: ${message.content}`,
          data: {
            originalMessage: message.content,
            timestamp: message.timestamp,
            chatType: chat.type,
          }
        });
      }
      
      // Check for diagnoses or medical conditions mentioned by AI
      if (message.role === 'assistant' && content.includes('diagnosis') || content.includes('condition') || content.includes('suggest')) {
        healthInsights.push({
          type: 'diagnosis' as const,
          title: `AI Analysis on ${new Date(message.timestamp).toLocaleDateString()}`,
          description: `AI provided analysis: ${message.content}`,
          data: {
            aiAnalysis: message.content,
            timestamp: message.timestamp,
            chatType: chat.type,
          }
        });
      }
    }

    // Save health insights to health history
    const savedRecords = [];
    for (const insight of healthInsights) {
      const recordId = await ctx.db.insert("healthHistory", {
        userId: args.userId,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        data: insight.data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      savedRecords.push(recordId);
    }

    return {
      extractedInsights: healthInsights.length,
      savedRecords,
    };
  },
});