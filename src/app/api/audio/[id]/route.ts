import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const audioUrl = await convex.query(api.songs.getAudioUrl, {
    id: id as Id<'songs'>,
  });

  if (!audioUrl) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Forward range header so seeking works
  const range = request.headers.get('range');
  const upstream = await fetch(audioUrl, {
    headers: range ? { Range: range } : {},
  });

  const headers = new Headers();
  headers.set('Content-Type', upstream.headers.get('Content-Type') ?? 'audio/mpeg');
  headers.set('Content-Disposition', 'inline');
  headers.set('Cache-Control', 'private, max-age=3600');
  headers.set('Accept-Ranges', 'bytes');

  const contentRange = upstream.headers.get('Content-Range');
  const contentLength = upstream.headers.get('Content-Length');
  if (contentRange) headers.set('Content-Range', contentRange);
  if (contentLength) headers.set('Content-Length', contentLength);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
