import { HeroSection } from '@/components/home/hero-section';
import { BusinessDirectorySection } from '@/components/home/business-directory';
import { BentoGrid } from '@/components/home/bento-grid';
import { CategorySection } from '@/components/home/category-section';
import { PartnerCta } from '@/components/home/partner-cta';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <BusinessDirectorySection />
      <BentoGrid />
      <CategorySection />
      <PartnerCta />
    </div>
  );
}
