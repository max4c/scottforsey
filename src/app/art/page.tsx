export const metadata = {
  title: 'Art — Scott Forsey',
  description: 'Art gallery by Scott Forsey. Digital paintings, pixel art, and mixed media.',
};

import { ArtGallery } from './art-gallery';

export default function ArtPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="font-pixel text-[10px] text-berry tracking-wider mb-2">GALLERY</p>
        <h1 className="font-display text-4xl font-bold text-brown">Art</h1>
        <p className="text-brown-light mt-2 max-w-lg">
          Click any piece to see it up close.
        </p>
      </div>
      <ArtGallery />
    </div>
  );
}
