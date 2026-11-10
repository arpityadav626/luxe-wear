import { HeroSection } from '@/sections/HeroSection';
import { PinnedStorySection } from '@/sections/PinnedStorySection';
import { FabricCraftSection } from '@/sections/FabricCraftSection';
import { HorizontalCollectionSection } from '@/sections/HorizontalCollectionSection';
import { StageTeaserSection } from '@/sections/StageTeaserSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PinnedStorySection />
      <FabricCraftSection />
      <HorizontalCollectionSection />
      <StageTeaserSection />
    </>
  );
}
