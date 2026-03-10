/**
 * One-time migration: download files from Convex storage and re-upload to R2.
 * Run with: npx tsx --env-file=.env.local scripts/migrate-to-r2.ts <admin-token>
 *
 * Requires env vars: NEXT_PUBLIC_CONVEX_URL, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
 * R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 */

import { ConvexHttpClient } from "convex/browser";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const token = process.argv[2];
if (!token) {
  console.error("Usage: npx tsx scripts/migrate-to-r2.ts <admin-token>");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

async function uploadToR2(
  url: string,
  key: string,
  retries = 3,
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      const body = await res.arrayBuffer();
      const contentType = res.headers.get("content-type") ?? "application/octet-stream";

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: new Uint8Array(body),
          ContentType: contentType,
        }),
      );

      return `${PUBLIC_URL}/${key}`;
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`    Retry ${attempt}/${retries} for ${key}...`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error("unreachable");
}

async function migrateAlbums() {
  const albums = await convex.query(api.albums.listAll, { token });
  let migrated = 0;
  for (const album of albums) {
    // Skip if already has an R2 URL or no cover at all
    if (!album.coverUrl?.includes("convex.cloud")) continue;
    // The coverUrl from the query is the resolved Convex storage URL
    const convexUrl = album.coverUrl;
    if (!convexUrl) continue;

    const key = `albums/${album._id}-cover`;
    const r2Url = await uploadToR2(convexUrl, key);
    await convex.mutation(api.albums.update, {
      token,
      id: album._id,
      coverUrl: r2Url,
    });
    migrated++;
    console.log(`  Album "${album.title}" → ${r2Url}`);
  }
  console.log(`Albums: migrated ${migrated}/${albums.length}`);
}

async function migrateSongs() {
  const songs = await convex.query(api.songs.listAll, { token });
  let migrated = 0;
  let failed = 0;
  for (const song of songs) {
    const url = (song as any).url;
    if (!url?.includes("convex.cloud")) continue;

    try {
      const key = `songs/${song._id}-audio`;
      const r2Url = await uploadToR2(url, key);
      await convex.mutation(api.songs.update, {
        token,
        id: song._id,
        audioUrl: r2Url,
      });
      migrated++;
      console.log(`  Song "${song.title}" → ${r2Url}`);
    } catch (err) {
      failed++;
      console.error(`  FAILED: "${song.title}" — ${err}`);
    }
  }
  console.log(`Songs: migrated ${migrated}, failed ${failed}, total ${songs.length}`);
}

async function migrateArtworks() {
  const artworks = await convex.query(api.artworks.listAll, { token });
  let migrated = 0;
  let failed = 0;
  for (const artwork of artworks) {
    const url = (artwork as any).url;
    if (!url?.includes("convex.cloud")) continue;

    try {
      const key = `artworks/${artwork._id}-image`;
      const r2Url = await uploadToR2(url, key);
      await convex.mutation(api.artworks.update, {
        token,
        id: artwork._id,
        imageUrl: r2Url,
      });
      migrated++;
      console.log(`  Artwork "${artwork.title}" → ${r2Url}`);
    } catch (err) {
      failed++;
      console.error(`  FAILED: "${artwork.title}" — ${err}`);
    }
  }
  console.log(`Artworks: migrated ${migrated}, failed ${failed}, total ${artworks.length}`);
}

async function main() {
  console.log("Starting migration to R2...\n");

  console.log("--- Albums ---");
  await migrateAlbums();

  console.log("\n--- Songs ---");
  await migrateSongs();

  console.log("\n--- Artworks ---");
  await migrateArtworks();

  console.log("\nMigration complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
