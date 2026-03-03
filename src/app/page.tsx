import { Hero } from '@/components/home/Hero';
import { FeaturedMusic } from '@/components/home/FeaturedMusic';
import { FeaturedArt } from '@/components/home/FeaturedArt';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedMusic />
      <FeaturedArt />
    </>
  );
}
