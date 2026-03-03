import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validateSession } from "./admin";

export const list = query({
  handler: async (ctx) => {
    const albums = await ctx.db.query("albums").collect();
    const visible = albums.filter((a) => a.isVisible).sort((a, b) => a.order - b.order);
    return Promise.all(
      visible.map(async (a) => ({
        ...a,
        coverUrl: a.coverStorageId ? await ctx.storage.getUrl(a.coverStorageId) : a.coverUrl ?? null,
      }))
    );
  },
});

export const listAll = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await validateSession(ctx, token);
    const albums = await ctx.db.query("albums").collect();
    return Promise.all(
      albums.sort((a, b) => a.order - b.order).map(async (a) => ({
        ...a,
        coverUrl: a.coverStorageId ? await ctx.storage.getUrl(a.coverStorageId) : a.coverUrl ?? null,
      }))
    );
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    coverStorageId: v.optional(v.id("_storage")),
    coverUrl: v.optional(v.string()),
    gradientFrom: v.optional(v.string()),
    gradientTo: v.optional(v.string()),
  },
  handler: async (ctx, { token, ...args }) => {
    await validateSession(ctx, token);
    const albums = await ctx.db.query("albums").collect();
    const maxOrder = albums.reduce((max, a) => Math.max(max, a.order), 0);
    return ctx.db.insert("albums", {
      ...args,
      order: maxOrder + 1,
      isVisible: true,
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("albums"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
    order: v.optional(v.number()),
    gradientFrom: v.optional(v.string()),
    gradientTo: v.optional(v.string()),
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
  args: { token: v.string(), id: v.id("albums") },
  handler: async (ctx, { token, id }) => {
    await validateSession(ctx, token);
    const album = await ctx.db.get(id);
    if (album?.coverStorageId) {
      await ctx.storage.delete(album.coverStorageId);
    }
    // Unassign songs from this album
    const songs = await ctx.db.query("songs").collect();
    for (const song of songs) {
      if (song.albumId === id) {
        await ctx.db.patch(song._id, { albumId: undefined });
      }
    }
    await ctx.db.delete(id);
  },
});
