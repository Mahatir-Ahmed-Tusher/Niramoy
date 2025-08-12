import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChatSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
    type: v.union(v.literal("symptom-analysis"), v.literal("general-inquiry"), v.literal("report-analyzer"), v.literal("drug-information")),
  },
  handler: async (ctx, args) => {
    const chatId = await ctx.db.insert("chatHistory", {
      userId: args.userId,
      sessionId: args.sessionId,
      messages: [],
      type: args.type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create or update user session
    await ctx.db.insert("userSessions", {
      sessionId: args.sessionId,
      userId: args.userId,
      isGuest: !args.userId,
      lastActivity: Date.now(),
      createdAt: Date.now(),
    });

    return chatId;
  },
});

export const addMessage = mutation({
  args: {
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chatHistory")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!chat) {
      throw new Error("Chat session not found");
    }

    const newMessage = {
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    };

    await ctx.db.patch(chat._id, {
      messages: [...chat.messages, newMessage],
      updatedAt: Date.now(),
    });

    // Update session activity
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        lastActivity: Date.now(),
      });
    }

    return chat._id;
  },
});

export const getChatHistory = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatHistory")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();
  },
});

export const getUserChats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatHistory")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getChatsByType = query({
  args: { 
    userId: v.string(),
    type: v.union(v.literal("symptom-analysis"), v.literal("general-inquiry"), v.literal("report-analyzer"), v.literal("drug-information"))
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatHistory")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .collect();
  },
});
