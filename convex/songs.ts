import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { validateSession } from "./admin";

export const list = query({
  handler: async (ctx) => {
    const songs = await ctx.db.query("songs").collect();
    const visible = songs.filter((s) => s.isVisible).sort((a, b) => a.order - b.order);
    return Promise.all(
      visible.map(async (s) => ({
        ...s,
        url: s.storageId ? await ctx.storage.getUrl(s.storageId) : s.audioUrl ?? null,
      }))
    );
  },
});

export const getFeatured = query({
  handler: async (ctx) => {
    const songs = await ctx.db.query("songs").collect();
    const featured = songs.filter((s) => s.isVisible && s.featured).sort((a, b) => a.order - b.order);
    return Promise.all(
      featured.map(async (s) => ({
        ...s,
        url: s.storageId ? await ctx.storage.getUrl(s.storageId) : s.audioUrl ?? null,
      }))
    );
  },
});

export const listAll = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await validateSession(ctx, token);
    const songs = await ctx.db.query("songs").collect();
    return Promise.all(
      songs.sort((a, b) => a.order - b.order).map(async (s) => ({
        ...s,
        url: s.storageId ? await ctx.storage.getUrl(s.storageId) : s.audioUrl ?? null,
      }))
    );
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    storageId: v.optional(v.id("_storage")),
    audioUrl: v.optional(v.string()),
    duration: v.number(),
    featured: v.boolean(),
    albumId: v.optional(v.id("albums")),
  },
  handler: async (ctx, { token, ...args }) => {
    await validateSession(ctx, token);
    const songs = await ctx.db.query("songs").collect();
    const maxOrder = songs.reduce((max, s) => Math.max(max, s.order), 0);
    return ctx.db.insert("songs", {
      ...args,
      order: maxOrder + 1,
      isVisible: true,
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("songs"),
    title: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    isVisible: v.optional(v.boolean()),
    order: v.optional(v.number()),
    albumId: v.optional(v.id("albums")),
    clearAlbum: v.optional(v.boolean()),
  },
  handler: async (ctx, { token, id, clearAlbum, ...updates }) => {
    await validateSession(ctx, token);
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    if (clearAlbum) {
      await ctx.db.patch(id, { ...filtered, albumId: undefined });
    } else {
      await ctx.db.patch(id, filtered);
    }
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("songs") },
  handler: async (ctx, { token, id }) => {
    await validateSession(ctx, token);
    const song = await ctx.db.get(id);
    if (song?.storageId) {
      await ctx.storage.delete(song.storageId);
    }
    await ctx.db.delete(id);
  },
});

export const seed = internalMutation({
  args: {
    songs: v.array(
      v.object({
        title: v.string(),
        audioUrl: v.string(),
        duration: v.number(),
        order: v.number(),
        featured: v.boolean(),
      })
    ),
  },
  handler: async (ctx, { songs }) => {
    const existing = await ctx.db.query("songs").collect();
    for (const s of existing) {
      await ctx.db.delete(s._id);
    }
    for (const song of songs) {
      await ctx.db.insert("songs", {
        ...song,
        isVisible: true,
      });
    }
  },
});
