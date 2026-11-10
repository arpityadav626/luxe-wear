import { HeroSection } from '@/sections/HeroSection';
import { PinnedStorySection } from '@/sections/PinnedStorySection';
import { FabricCraftSection } from '@/sections/FabricCraftSection';
import { HorizontalCollectionSection } from '@/sections/HorizontalCollectionSection';
import { LookbookSection } from '@/sections/LookbookSection';
import { ValuesSection } from '@/sections/ValuesSection';
import { DropCtaSection } from '@/sections/DropCtaSection';
import { FooterSection } from '@/sections/FooterSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PinnedStorySection />
      <FabricCraftSection />
      <HorizontalCollectionSection />
      <LookbookSection />
      <ValuesSection />
      <DropCtaSection />
      <FooterSection />
    </>
  );
}
