'use client';

import { useState } from 'react';

type ModalType = 'privacy' | 'terms' | 'contact' | null;

const MODAL_CONTENT: Record<NonNullable<ModalType>, { title: string; content: React.ReactNode }> = {
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed normal-case tracking-normal">
        <p><strong>Last updated:</strong> {new Date().getFullYear()}</p>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">1. Data We Collect</h3>
          <p>When you book through BookMeNow, we collect your name, email, phone number, and appointment details. This data is necessary to confirm and manage your reservations.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">2. How We Use Your Data</h3>
          <p>Your data is used exclusively to manage bookings, send appointment reminders, and improve our service. We do not sell or share your personal information with third parties.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">3. Data Retention</h3>
          <p>We retain your booking history for up to 2 years. You may request deletion of your data at any time by contacting us.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">4. Your Rights (GDPR)</h3>
          <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at the address below.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">5. Contact</h3>
          <p>For privacy-related inquiries: <a href="mailto:privacy@bookmenow.app" className="text-primary underline">privacy@bookmenow.app</a></p>
        </section>
      </div>
    ),
  },
  terms: {
    title: 'Terms of Service',
    content: (
      <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed normal-case tracking-normal">
        <p><strong>Last updated:</strong> {new Date().getFullYear()}</p>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">1. Bookings</h3>
          <p>By booking through BookMeNow, you agree to attend your appointment at the scheduled time. Bookings are confirmed upon receiving a confirmation message.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">2. Cancellations & Modifications</h3>
          <p>Cancellations must be made at least 24 hours before the appointment. Late cancellations or no-shows may be subject to a fee as set by the business.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">3. Liability</h3>
          <p>BookMeNow acts as a booking platform. The service itself is provided by the business you book with. We are not responsible for the quality of services rendered.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">4. Account Use</h3>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">5. Changes to Terms</h3>
          <p>We reserve the right to modify these terms. Continued use of the service constitutes acceptance of updated terms.</p>
        </section>
      </div>
    ),
  },
  contact: {
    title: 'Contact Us',
    content: (
      <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed normal-case tracking-normal">
        <p>Have questions or need support? Reach us through any of the following channels:</p>

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
              <p className="font-medium text-slate-900 dark:text-white">Support Hours</p>
              <p>Monday – Friday, 9:00 – 18:00 (CET)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-base mt-0.5">help</span>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">General Enquiries</p>
              <p>For business partnerships or press inquiries: <a href="mailto:hello@bookmenow.app" className="text-primary underline">hello@bookmenow.app</a></p>
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
      <footer className="w-full rounded-t-[32px] bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center px-16 py-20 font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest">
        <div className="mb-12 md:mb-0">
          <div className="text-lg font-black text-slate-900 dark:text-white mb-4">BookMeNow</div>
          <p className="text-slate-400 dark:text-slate-600 normal-case tracking-normal max-w-xs">
            © {new Date().getFullYear()} BookMeNow. Curated with Intention.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-12">
          {(['privacy', 'terms', 'contact'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setOpen(key)}
              className="text-slate-400 dark:text-slate-600 hover:text-primary transition-colors hover:opacity-70 uppercase tracking-widest text-sm bg-transparent border-none cursor-pointer"
            >
              {key === 'privacy' ? 'Privacy Policy' : key === 'terms' ? 'Terms of Service' : 'Contact Us'}
            </button>
          ))}
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
                aria-label="Close"
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
