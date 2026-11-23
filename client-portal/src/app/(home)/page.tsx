import { HomeExplorer } from '@/components/home/home-explorer';
import { ParaNegocios } from '@/components/home/para-negocios';
import { ComoFunciona } from '@/components/home/como-funciona';
import { CtaFinal } from '@/components/home/cta-final';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HomeExplorer />
      <ParaNegocios />
      <ComoFunciona />
      <CtaFinal />
    </div>
  );
}
