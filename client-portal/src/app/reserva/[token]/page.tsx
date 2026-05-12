import { notFound } from 'next/navigation';
import { getReservaByToken } from '@/lib/api';
import { GestioReservaClient } from './GestioReservaClient';

export default async function GestioReservaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let reserva;
  try {
    reserva = await getReservaByToken(token);
  } catch {
    notFound();
  }

  return <GestioReservaClient reserva={reserva} token={token} />;
}
