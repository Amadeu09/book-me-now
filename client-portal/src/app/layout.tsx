import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'BookMeNow · Reserva tu cita online',
  description: 'Encuentra peluquerías, barberías, centros de estética y más, mira sus huecos libres y reserva en segundos. Y si tienes un negocio, gestiona tus reservas, tu equipo y tus horarios.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`scroll-smooth ${outfit.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plusJakartaSans.className} antialiased`}>
        <Navbar />
        <main className="pt-[72px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
