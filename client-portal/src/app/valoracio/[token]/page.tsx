import { notFound } from 'next/navigation';
import { getReservaValoracioInfo } from '@/lib/api';
import { ValoracioClient } from './ValoracioClient';

export default async function ValoracioPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let info;
  try {
    info = await getReservaValoracioInfo(token);
  } catch {
    notFound();
  }

  return <ValoracioClient info={info} token={token} />;
}
