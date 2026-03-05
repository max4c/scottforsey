import type { Metadata } from 'next';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Suspense } from 'react';
import AlbumContent from './album-content';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ track?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { track } = await searchParams;

  const albums = await convex.query(api.albums.list);
  const album = albums.find((a: { title: string }) => slugify(a.title) === slug);

  if (!album) {
    return { title: 'Album Not Found — Scott Forsey' };
  }

  let title = `${album.title} — Scott Forsey`;
  let description = album.description || `Listen to ${album.title} by Scott Forsey.`;

  if (track) {
    const songs = await convex.query(api.songs.list);
    const song = songs.find((s: { title: string; albumId?: string }) =>
      s.albumId === album._id && slugify(s.title) === track
    );
    if (song) {
      title = `${song.title} — ${album.title} — Scott Forsey`;
      description = `Listen to "${song.title}" from ${album.title} by Scott Forsey.`;
    }
  }

  const ogImage = album.coverUrl || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImage && { images: [{ url: ogImage }] }),
      type: 'music.album',
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default function AlbumPage() {
  return (
    <Suspense>
      <AlbumContent />
    </Suspense>
  );
}
