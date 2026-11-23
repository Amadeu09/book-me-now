'use client';

import { useState } from 'react';
import { HeroSection } from './hero-section';
import { BusinessDirectorySection } from './business-directory';
import { NegocisEnAccio } from './negocis-en-accio';

/** Uneix el cercador de l'inici amb el directori: triar un tipus filtra i hi baixa. */
export function HomeExplorer() {
  const [tipo, setTipo] = useState<string | null>(null);

  const filtraIBaixa = (nou: string | null) => {
    setTipo(nou);
    document.getElementById('negocios')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <HeroSection onTipo={filtraIBaixa} />
      <NegocisEnAccio onTipo={filtraIBaixa} />
      <BusinessDirectorySection tipo={tipo} onTipo={setTipo} />
    </>
  );
}
