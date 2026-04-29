const EXT_MIME: Record<string, string> = {
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  aac: "audio/aac",
  flac: "audio/flac",
  ogg: "audio/ogg",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  svg: "image/svg+xml",
};

// Strict HTTP token / MIME pattern. iOS Safari throws
// "The string did not match the expected pattern" if a header value
// contains anything outside this set.
const SAFE_MIME = /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/;

function extOf(file: File): string | undefined {
  const dot = file.name.lastIndexOf(".");
  if (dot < 0) return undefined;
  return file.name.slice(dot + 1).toLowerCase();
}

function resolveContentType(file: File): string {
  const ext = extOf(file);
  if (ext && EXT_MIME[ext]) return EXT_MIME[ext];
  if (file.type && SAFE_MIME.test(file.type)) return file.type;
  return "application/octet-stream";
}

function safeFilename(name: string): string {
  // Replace anything outside a conservative ASCII set so the S3 key
  // and signed URL can't contain characters that break URL parsing
  // on iOS Safari (e.g. unicode, control chars, fancy quotes).
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned || "file";
}

export async function uploadToR2(
  file: File,
  folder: string,
  token: string,
): Promise<string> {
  const contentType = resolveContentType(file);
  const filename = safeFilename(file.name);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename,
      contentType,
      folder,
      token,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Upload failed");
  }

  const { uploadUrl, publicUrl } = await res.json();

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error(`R2 upload failed: ${putRes.status} ${putRes.statusText}`);
  }

  return publicUrl;
}
