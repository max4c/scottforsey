import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { validateSession } from "./admin";

export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await validateSession(ctx, token);
    return await ctx.storage.generateUploadUrl();
  },
});
