import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { validateSession } from "./admin";

export const list = query({
  handler: async (ctx) => {
    const artworks = await ctx.db.query("artworks").collect();
    const visible = artworks.filter((a) => a.isVisible);
    return Promise.all(
      visible.map(async (a) => ({
        ...a,
        url: a.imageUrl ?? (a.storageId ? await ctx.storage.getUrl(a.storageId) : null),
      }))
    );
  },
});

export const getFeatured = query({
  handler: async (ctx) => {
    const artworks = await ctx.db.query("artworks").collect();
    const featured = artworks.filter((a) => a.isVisible && a.featured);
    return Promise.all(
      featured.map(async (a) => ({
        ...a,
        url: a.imageUrl ?? (a.storageId ? await ctx.storage.getUrl(a.storageId) : null),
      }))
    );
  },
});

export const listAll = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await validateSession(ctx, token);
    const artworks = await ctx.db.query("artworks").collect();
    return Promise.all(
      artworks.map(async (a) => ({
        ...a,
        url: a.imageUrl ?? (a.storageId ? await ctx.storage.getUrl(a.storageId) : null),
      }))
    );
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    storageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    medium: v.string(),
    year: v.number(),
    dimensions: v.string(),
    series: v.string(),
    featured: v.boolean(),
    aspectRatio: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { token, ...args }) => {
    await validateSession(ctx, token);
    return ctx.db.insert("artworks", {
      ...args,
      isVisible: true,
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("artworks"),
    title: v.optional(v.string()),
    medium: v.optional(v.string()),
    year: v.optional(v.number()),
    dimensions: v.optional(v.string()),
    series: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    isVisible: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { token, id, ...updates }) => {
    await validateSession(ctx, token);
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("artworks") },
  handler: async (ctx, { token, id }) => {
    await validateSession(ctx, token);
    const artwork = await ctx.db.get(id);
    if (artwork?.storageId) {
      await ctx.storage.delete(artwork.storageId);
    }
    await ctx.db.delete(id);
  },
});

export const seed = internalMutation({
  args: {
    artworks: v.array(
      v.object({
        title: v.string(),
        imageUrl: v.string(),
        medium: v.string(),
        year: v.number(),
        dimensions: v.string(),
        series: v.string(),
        featured: v.boolean(),
        aspectRatio: v.number(),
        description: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { artworks }) => {
    const existing = await ctx.db.query("artworks").collect();
    for (const a of existing) {
      await ctx.db.delete(a._id);
    }
    for (const artwork of artworks) {
      await ctx.db.insert("artworks", {
        ...artwork,
        isVisible: true,
      });
    }
  },
});
