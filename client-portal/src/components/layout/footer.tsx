import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full rounded-t-[32px] bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center px-16 py-20 font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest">
      <div className="mb-12 md:mb-0">
        <div className="text-lg font-black text-slate-900 dark:text-white mb-4">BookMeNow</div>
        <p className="text-slate-400 dark:text-slate-600 normal-case tracking-normal max-w-xs">
          © {new Date().getFullYear()} BookMeNow. Curated with Intention.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-12">
        <Link href="#" className="text-slate-400 dark:text-slate-600 hover:text-primary transition-colors opacity-100 hover:opacity-70">
          Privacy Policy
        </Link>
        <Link href="#" className="text-slate-400 dark:text-slate-600 hover:text-primary transition-colors opacity-100 hover:opacity-70">
          Terms of Service
        </Link>
        <Link href="#" className="text-slate-400 dark:text-slate-600 hover:text-primary transition-colors opacity-100 hover:opacity-70">
          Contact Us
        </Link>
        <Link href="#" className="text-slate-400 dark:text-slate-600 hover:text-primary transition-colors opacity-100 hover:opacity-70">
          Press Kit
        </Link>
      </div>
      <div className="mt-12 md:mt-0 flex gap-6">
        <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary transition-colors">public</span>
        <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary transition-colors">brand_awareness</span>
        <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary transition-colors">alternate_email</span>
      </div>
    </footer>
  );
}
