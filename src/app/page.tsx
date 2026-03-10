import { Hero } from '@/components/home/Hero';
import { FeaturedAlbums } from '@/components/home/FeaturedAlbums';
import { FeaturedMusic } from '@/components/home/FeaturedMusic';
import { FeaturedArt } from '@/components/home/FeaturedArt';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedAlbums />
      <FeaturedMusic />
      <FeaturedArt />
    </>
  );
}
