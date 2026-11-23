import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { esc, plantillaEmail } from '../common/utils/email-plantilla';
import { DadesAvis, textAvis } from './avisos.textos';

export interface AvisReserva extends DadesAvis {
  empresaId: number;
  treballadorId: number | null;
  reservaId: number;
}

const DIES_CONSERVACIO = 60;

@Injectable()
export class AvisosService implements OnModuleInit {
  private readonly logger = new Logger(AvisosService.name);
  private pushActiu = false;
  clauPublica: string | null = null;
  private readonly appUrl: string;
  private readonly subjecte: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {
    this.appUrl = (config.get<string>('APP_URL') ?? 'https://app.bookmenow.org').replace(/\/$/, '');
    this.subjecte = config.get<string>('VAPID_SUBJECT') ?? 'mailto:reservas@bookmenow.org';
    // Claus per variable d'entorn (opcional): tenen prioritat sobre les de la base de dades
    const publica = config.get<string>('VAPID_PUBLIC_KEY');
    const privada = config.get<string>('VAPID_PRIVATE_KEY');
    if (publica && privada) this.activarPush(publica, privada);
  }

  /** Sense claus per entorn, fa servir les de la base de dades i, si no n'hi ha, les genera. */
  async onModuleInit() {
    if (this.pushActiu) return;
    try {
      let claus = await this.prisma.clauVapid.findUnique({ where: { id: 1 } });
      if (!claus) {
        const noves = webpush.generateVAPIDKeys();
        // Si dues instàncies arrenquen alhora, només una crea la fila i totes llegeixen la mateixa
        await this.prisma.clauVapid.createMany({ data: [{ id: 1, publica: noves.publicKey, privada: noves.privateKey }], skipDuplicates: true });
        claus = await this.prisma.clauVapid.findUnique({ where: { id: 1 } });
        this.logger.log('Claus VAPID generades per a les notificacions push');
      }
      if (claus) this.activarPush(claus.publica, claus.privada);
    } catch (e) {
      this.logger.warn(`Notificacions push desactivades: ${(e as Error).message}`);
    }
  }

  private activarPush(publica: string, privada: string) {
    webpush.setVapidDetails(this.subjecte, publica, privada);
    this.clauPublica = publica;
    this.pushActiu = true;
  }

  /**
   * Avisa els administradors de l'empresa i el treballador assignat:
   * avís a la campana, notificació push i email. Mai fa fallar la petició que l'ha originat.
   */
  avisarNegoci(avis: AvisReserva): void {
    void this.enviar(avis).catch((err) =>
      this.logger.error('Error avisant el negoci', err instanceof Error ? err.stack : String(err)),
    );
  }

  private async enviar(avis: AvisReserva) {
    const destinataris = await this.prisma.usuari.findMany({
      where: {
        empresaId: avis.empresaId,
        OR: [
          { rol: 'ADMIN_GENERAL' },
          ...(avis.treballadorId ? [{ treballador: { id: avis.treballadorId } }] : []),
        ],
      },
      select: { id: true, email: true, idioma: true, subscripcionsPush: true },
    });
    if (destinataris.length === 0) return;

    // 1. Campana
    await this.prisma.notificacio.createMany({
      data: destinataris.map((u) => ({ usuariId: u.id, tipus: avis.tipus, reservaId: avis.reservaId, ...textAvis(avis, u.idioma) })),
    });

    // 2. Push
    if (this.pushActiu) {
      const url = '/bookings';
      await Promise.all(destinataris.flatMap((u) => {
        const { titol, cos } = textAvis(avis, u.idioma);
        const payload = JSON.stringify({ titol, cos, url, tag: `reserva-${avis.reservaId}` });
        return u.subscripcionsPush.map((s) => this.enviarPush(s, payload));
      }));
    }

    // 3. Email, agrupat per idioma
    const perIdioma = new Map<string, string[]>();
    for (const u of destinataris) {
      const idioma = u.idioma === 'es' ? 'es' : 'ca';
      perIdioma.set(idioma, [...(perIdioma.get(idioma) ?? []), u.email]);
    }
    for (const [idioma, emails] of perIdioma) {
      const { titol, cos } = textAvis(avis, idioma);
      this.email.sendInBackground({
        to: [...new Set(emails)],
        subject: `${titol} — ${avis.serveiNom}`,
        html: plantillaEmail({
          titol,
          cos: `<p>${esc(cos)}</p>`,
          boto: { text: idioma === 'es' ? 'Ver la agenda' : "Veure l'agenda", url: `${this.appUrl}/bookings` },
          peu: idioma === 'es'
            ? 'Recibes este aviso porque eres administrador o tienes asignada esta cita en BookMeNow.'
            : "Reps aquest avís perquè ets administrador o tens assignada aquesta cita a BookMeNow.",
        }),
      });
    }
  }

  private async enviarPush(s: { id: number; endpoint: string; p256dh: string; auth: string }, payload: string) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 24 * 60 * 60 });
    } catch (err) {
      const codi = (err as { statusCode?: number }).statusCode;
      if (codi === 404 || codi === 410) {
        // El navegador ha retirat la subscripció: la traiem
        await this.prisma.pushSubscripcio.deleteMany({ where: { id: s.id } });
      } else {
        this.logger.warn(`Push no enviada (${codi ?? 'error'})`);
      }
    }
  }

  /* ── Campana ───────────────────────────────────────── */

  async llistar(usuariId: number) {
    const [data, noLlegides] = await Promise.all([
      this.prisma.notificacio.findMany({ where: { usuariId }, orderBy: { createdAt: 'desc' }, take: 30 }),
      this.prisma.notificacio.count({ where: { usuariId, llegida: false } }),
    ]);
    return { data, noLlegides };
  }

  async marcarLlegides(usuariId: number, id?: number) {
    await this.prisma.notificacio.updateMany({ where: { usuariId, llegida: false, ...(id ? { id } : {}) }, data: { llegida: true } });
    return { ok: true };
  }

  /* ── Subscripcions push ────────────────────────────── */

  async subscriure(usuariId: number, endpoint: string, p256dh: string, auth: string) {
    // Si el navegador ja estava subscrit (fins i tot amb un altre usuari), queda per a l'usuari actual
    await this.prisma.pushSubscripcio.upsert({
      where: { endpoint },
      create: { usuariId, endpoint, p256dh, auth },
      update: { usuariId, p256dh, auth },
    });
    return { ok: true };
  }

  async donarDeBaixa(usuariId: number, endpoint: string) {
    await this.prisma.pushSubscripcio.deleteMany({ where: { usuariId, endpoint } });
    return { ok: true };
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async netejar() {
    const limit = new Date(Date.now() - DIES_CONSERVACIO * 24 * 60 * 60 * 1000);
    const { count } = await this.prisma.notificacio.deleteMany({ where: { createdAt: { lt: limit } } });
    if (count) this.logger.log(`Avisos antics esborrats: ${count}`);
  }
}
