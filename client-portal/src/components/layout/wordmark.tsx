/** Logotip escrit: "book me now" amb "now" en el color de la marca. */
export function Wordmark({ dark = false, className = '' }: { dark?: boolean; className?: string }) {
  return (
    <span
      className={`font-medium tracking-[0.01em] ${dark ? 'text-white' : 'text-brand-ink'} ${className}`}
      style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}
    >
      book<span className="font-semibold">me</span>
      <span className={dark ? 'text-brand-lila' : 'text-brand'}>now</span>
    </span>
  );
}
