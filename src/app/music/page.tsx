import type { Metadata } from 'next';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import { Suspense } from 'react';
import { MusicPageContent } from './music-content';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

type Props = {
  searchParams: Promise<{ track?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { track } = await searchParams;

  if (track) {
    const songs = await convex.query(api.songs.list);
    const song = songs.find((s: { title: string }) => slugify(s.title) === track);
    if (song) {
      const title = `${song.title} — Scott Forsey`;
      const description = `Listen to "${song.title}" by Scott Forsey.`;
      return {
        title,
        description,
        openGraph: { title, description },
        twitter: { card: 'summary', title, description },
      };
    }
  }

  return {
    title: 'Music — Scott Forsey',
    description: 'Listen to music by Scott Forsey.',
  };
}

export default function MusicPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="font-pixel text-[10px] text-sunset tracking-wider mb-2">TRACKS</p>
        <h1 className="font-display text-4xl font-bold text-brown">Music</h1>
      </div>
      <Suspense>
        <MusicPageContent />
      </Suspense>
    </div>
  );
}
