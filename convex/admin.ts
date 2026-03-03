import { v } from "convex/values";
import { action, internalMutation, QueryCtx, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";

export async function validateSession(
  ctx: QueryCtx | MutationCtx,
  token: string
) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized");
  }
}

export const login = action({
  args: { password: v.string() },
  handler: async (ctx, { password }) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      throw new Error("Invalid password");
    }
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    await ctx.runMutation(internal.admin.createSession, { token, expiresAt });
    return token;
  },
});

export const createSession = internalMutation({
  args: { token: v.string(), expiresAt: v.number() },
  handler: async (ctx, { token, expiresAt }) => {
    await ctx.db.insert("sessions", { token, expiresAt });
  },
});

export const checkSession = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<boolean> => {
    const result: boolean = await ctx.runMutation(internal.admin.validateToken, { token });
    return result;
  },
});

export const validateToken = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    return !!(session && session.expiresAt > Date.now());
  },
});
