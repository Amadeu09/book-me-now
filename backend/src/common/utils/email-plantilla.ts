import { escapeHtml } from './html.utils';

/** Escapa text per inserir-lo dins d'un email HTML. */
export const esc = escapeHtml;

/** Plantilla senzilla dels emails de BookMeNow. `cos` ja ha de venir escapat. */
export function plantillaEmail(opts: { titol: string; cos: string; boto?: { text: string; url: string }; peu?: string }): string {
  const boto = opts.boto
    ? `<a href="${esc(opts.boto.url)}" style="display:inline-block;margin:20px 0 8px;padding:14px 28px;background:#5B5BD6;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">${esc(opts.boto.text)}</a>`
    : '';
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;color:#14142B;">
    <p style="margin:0 0 24px;font-size:20px;font-weight:600;letter-spacing:0.01em;">book<b>me</b><span style="color:#5B5BD6">now</span></p>
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">${esc(opts.titol)}</h1>
    <div style="font-size:15px;line-height:1.6;color:#3A3A52;">${opts.cos}</div>
    ${boto}
    <p style="margin:28px 0 0;font-size:12px;color:#8A8AA0;">${opts.peu ?? 'Has rebut aquest correu perquè tens un compte a BookMeNow.'}</p>
  </div>`;
}
