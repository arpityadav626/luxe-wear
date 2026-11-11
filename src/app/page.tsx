import { HeroSection } from '@/sections/HeroSection';
import { PinnedStorySection } from '@/sections/PinnedStorySection';
import { FabricCraftSection } from '@/sections/FabricCraftSection';
import { FullBleedSection } from '@/sections/FullBleedSection';
import { HorizontalCollectionSection } from '@/sections/HorizontalCollectionSection';
import { LookbookSection } from '@/sections/LookbookSection';
import { DropCtaSection } from '@/sections/DropCtaSection';
import { FooterSection } from '@/sections/FooterSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PinnedStorySection />
      <FabricCraftSection />
      <FullBleedSection />
      <HorizontalCollectionSection />
      <LookbookSection />
      <DropCtaSection />
      <FooterSection />
    </>
  );
}
