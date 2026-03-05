import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  albums: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    coverStorageId: v.optional(v.id("_storage")),
    coverUrl: v.optional(v.string()),
    gradientFrom: v.optional(v.string()),
    gradientTo: v.optional(v.string()),
    order: v.number(),
    isVisible: v.boolean(),
    albumType: v.optional(v.union(v.literal('album'), v.literal('draft'))),
  }),

  songs: defineTable({
    title: v.string(),
    storageId: v.optional(v.id("_storage")),
    audioUrl: v.optional(v.string()),
    duration: v.number(),
    order: v.number(),
    featured: v.boolean(),
    isVisible: v.boolean(),
    albumId: v.optional(v.id("albums")),
    genre: v.optional(v.string()),
  }),

  artworks: defineTable({
    title: v.string(),
    storageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    medium: v.string(),
    year: v.number(),
    dimensions: v.string(),
    series: v.string(),
    featured: v.boolean(),
    aspectRatio: v.number(),
    isVisible: v.boolean(),
    description: v.optional(v.string()),
  }),

  sessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  siteSettings: defineTable({
    profileImageStorageId: v.optional(v.id("_storage")),
    faviconStorageId: v.optional(v.id("_storage")),
  }),
});
