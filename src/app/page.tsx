import { HeroSection } from '@/sections/HeroSection';
import { PinnedStorySection } from '@/sections/PinnedStorySection';
import { StageTeaserSection } from '@/sections/StageTeaserSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PinnedStorySection />
      <StageTeaserSection />
    </>
  );
}
