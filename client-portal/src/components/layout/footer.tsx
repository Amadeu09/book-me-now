'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogoMark } from './logo';
import { Wordmark } from './wordmark';
import { ACCES_URL, REGISTRE_URL } from '@/lib/links';

type ModalType = 'privacy' | 'terms' | 'contact' | null;

const MODAL_CONTENT: Record<NonNullable<ModalType>, { title: string; content: React.ReactNode }> = {
  privacy: {
    title: 'Política de privacidad',
    content: (
      <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed normal-case tracking-normal">
        <p><strong>Última actualización:</strong> {new Date().getFullYear()}</p>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">1. Datos que recogemos</h3>
          <p>Cuando reservas a través de BookMeNow recogemos tu nombre, email, teléfono y los datos de la cita. Son necesarios para confirmar y gestionar tus reservas.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">2. Para qué los usamos</h3>
          <p>Usamos tus datos solo para gestionar las reservas, enviarte recordatorios y mejorar el servicio. No vendemos ni cedemos tus datos personales a terceros.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">3. Conservación</h3>
          <p>Conservamos tu historial de reservas un máximo de 2 años. Puedes pedir que borremos tus datos en cualquier momento escribiéndonos.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">4. Tus derechos (RGPD)</h3>
          <p>Tienes derecho a acceder, rectificar o suprimir tus datos personales. Para ejercerlo, escríbenos a la dirección de abajo.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">5. Contacto</h3>
          <p>Para consultas sobre privacidad: <a href="mailto:privacy@bookmenow.app" className="text-primary underline">privacy@bookmenow.app</a></p>
        </section>
      </div>
    ),
  },
  terms: {
    title: 'Términos del servicio',
    content: (
      <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed normal-case tracking-normal">
        <p><strong>Última actualización:</strong> {new Date().getFullYear()}</p>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">1. Reservas</h3>
          <p>Al reservar con BookMeNow te comprometes a acudir a la cita a la hora acordada. La reserva queda confirmada cuando recibes el mensaje de confirmación.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">2. Cancelaciones y cambios</h3>
          <p>Las cancelaciones deben hacerse al menos 24 horas antes de la cita. Las cancelaciones tardías o no presentarse pueden tener un cargo, según lo que fije cada negocio.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">3. Responsabilidad</h3>
          <p>BookMeNow es una plataforma de reservas. El servicio lo presta el negocio con el que reservas, y no somos responsables de su calidad.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">4. Uso de la cuenta</h3>
          <p>Eres responsable de mantener la confidencialidad de tus credenciales y de toda la actividad de tu cuenta.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">5. Cambios en los términos</h3>
          <p>Podemos modificar estos términos. Seguir usando el servicio implica aceptar los términos actualizados.</p>
        </section>
      </div>
    ),
  },
  contact: {
    title: 'Contacto',
    content: (
      <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed normal-case tracking-normal">
        <p>¿Tienes dudas o necesitas ayuda? Puedes contactarnos por estos canales:</p>

        <section className="space-y-2">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-base mt-0.5">mail</span>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Email</p>
              <a href="mailto:support@bookmenow.app" className="text-primary underline">support@bookmenow.app</a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-base mt-0.5">schedule</span>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Horario de atención</p>
              <p>De lunes a viernes, de 9:00 a 18:00</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-base mt-0.5">help</span>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Otras consultas</p>
              <p>Para colaboraciones o prensa: <a href="mailto:hello@bookmenow.app" className="text-primary underline">hello@bookmenow.app</a></p>
            </div>
          </div>
        </section>
      </div>
    ),
  },
};

export function Footer() {
  const [open, setOpen] = useState<ModalType>(null);
  const modal = open ? MODAL_CONTENT[open] : null;

  return (
    <>
      <footer className="border-t border-brand-line bg-white">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 py-12 md:py-14 flex flex-col gap-10">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div className="flex flex-col gap-3 max-w-[300px]">
              <div className="flex items-center gap-2.5"><LogoMark size={32} /><Wordmark className="text-[20px]" /></div>
              <p className="m-0 text-[14px] leading-relaxed text-brand-muted">Reservas online para negocios de proximidad.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-14 gap-y-8 text-[14px]">
              <div className="flex flex-col gap-2.5">
                <p className="m-0 font-bold text-brand-ink">Clientes</p>
                <Link href="/#negocios" className="text-brand-muted hover:text-brand">Buscar negocios</Link>
                <Link href="/#como-funciona" className="text-brand-muted hover:text-brand">Cómo funciona</Link>
              </div>
              <div className="flex flex-col gap-2.5">
                <p className="m-0 font-bold text-brand-ink">Negocios</p>
                <a href={REGISTRE_URL} className="text-brand-muted hover:text-brand">Registra tu negocio</a>
                <a href={ACCES_URL} className="text-brand-muted hover:text-brand">Acceso al panel</a>
              </div>
              <div className="flex flex-col gap-2.5 items-start">
                <p className="m-0 font-bold text-brand-ink">Legal</p>
                {(['privacy', 'terms', 'contact'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setOpen(key)}
                    className="p-0 bg-transparent border-0 text-left text-brand-muted hover:text-brand cursor-pointer"
                  >
                    {key === 'privacy' ? 'Privacidad' : key === 'terms' ? 'Términos' : 'Contacto'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="m-0 text-[13px] text-brand-muted">© {new Date().getFullYear()} BookMeNow</p>
        </div>
      </footer>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col font-['Plus_Jakarta_Sans']"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{modal.title}</h2>
              <button
                onClick={() => setOpen(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{modal.content}</div>
          </div>
        </div>
      )}
    </>
  );
}
