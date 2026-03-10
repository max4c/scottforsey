import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validateSession } from "./admin";

export const get = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("siteSettings").first();
    if (!settings) return { profileImageUrl: null, faviconUrl: null };
    return {
      profileImageUrl: settings.profileImageUrl
        ?? (settings.profileImageStorageId
          ? await ctx.storage.getUrl(settings.profileImageStorageId)
          : null),
      faviconUrl: settings.faviconUrl
        ?? (settings.faviconStorageId
          ? await ctx.storage.getUrl(settings.faviconStorageId)
          : null),
    };
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    profileImageStorageId: v.optional(v.id("_storage")),
    faviconStorageId: v.optional(v.id("_storage")),
    profileImageUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
  },
  handler: async (ctx, { token, ...updates }) => {
    await validateSession(ctx, token);
    const existing = await ctx.db.query("siteSettings").first();
    const patch = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("siteSettings", patch);
    }
  },
});
