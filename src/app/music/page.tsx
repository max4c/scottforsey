export const metadata = {
  title: 'Music — Scott Forsey',
  description: 'Listen to music by Scott Forsey.',
};

import { Suspense } from 'react';
import { MusicPageContent } from './music-content';

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
