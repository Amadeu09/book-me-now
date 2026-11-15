import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';

/** No s'envia l'email de valoració de cites acabades fa més d'aquests dies. */
const MAX_DIES_ENRERE = 7;
/** Màxim de reserves revisades per execució. */
const LOT = 100;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Envia l'email "Com ha anat la teva cita?" quan acaba cada cita.
 * Substitueix la cua Bull/Redis: una tasca programada revisa la base de dades
 * i marca cada reserva com a enviada abans d'enviar (segur amb diverses instàncies).
 */
@Injectable()
export class EmailPostCitaService {
  private readonly logger = new Logger(EmailPostCitaService.name);
  private readonly resend: Resend;
  private readonly emailFrom: string;
  private readonly portalUrl: string;
  private executant = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.emailFrom = this.config.get<string>('EMAIL_FROM');
    this.portalUrl = this.config.get<string>('PORTAL_URL', 'http://localhost:3002');
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async enviarPendents(): Promise<void> {
    if (this.executant) return;
    this.executant = true;
    try {
      const ara = new Date();
      const desde = new Date(ara.getTime() - MAX_DIES_ENRERE * 24 * 60 * 60 * 1000);

      const candidates = await this.prisma.reserva.findMany({
        where: {
          emailPostCitaEnviat: false,
          clientEmail: { not: null },
          estat: { notIn: ['CANCELLADA', 'NO_SHOW'] },
          dataHora: { gte: desde, lte: ara },
        },
        include: { servei: { select: { nom: true, duradaMin: true } } },
        orderBy: { dataHora: 'asc' },
        take: LOT,
      });

      for (const reserva of candidates) {
        const fi = new Date(reserva.dataHora.getTime() + reserva.servei.duradaMin * 60 * 1000);
        if (fi > ara) continue;

        // Reclamar la reserva: si una altra instància ja l'ha agafat, count = 0.
        const { count } = await this.prisma.reserva.updateMany({
          where: { id: reserva.id, emailPostCitaEnviat: false },
          data: { emailPostCitaEnviat: true },
        });
        if (count === 0) continue;

        try {
          await this.enviar({
            email: reserva.clientEmail,
            nom: reserva.clientNom ?? '',
            serveiNom: reserva.servei.nom,
            dataHoraInici: reserva.dataHora,
            tokenValoracio: reserva.tokenValoracio,
          });
        } catch (err) {
          this.logger.error(`Error enviant email post-cita (reserva ${reserva.id})`, err instanceof Error ? err.stack : String(err));
          // Es tornarà a intentar a la propera execució.
          await this.prisma.reserva.update({
            where: { id: reserva.id },
            data: { emailPostCitaEnviat: false },
          });
        }
      }
    } catch (err) {
      this.logger.error('Error revisant emails post-cita', err instanceof Error ? err.stack : String(err));
    } finally {
      this.executant = false;
    }
  }

  private async enviar(dades: {
    email: string;
    nom: string;
    serveiNom: string;
    dataHoraInici: Date;
    tokenValoracio: string | null;
  }): Promise<void> {
    const dataFormatada = dades.dataHoraInici.toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Madrid' });
    const horaFormatada = dades.dataHoraInici.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });

    const nom = escapeHtml(dades.nom);
    const serveiNom = escapeHtml(dades.serveiNom);
    const valoracioLink = dades.tokenValoracio
      ? `${this.portalUrl}/valoracio/${encodeURIComponent(dades.tokenValoracio)}`
      : null;

    const { error } = await this.resend.emails.send({
      from: this.emailFrom,
      to: dades.email,
      subject: `Com ha anat la teva cita de ${dades.serveiNom}?`,
      html: `
        <h2>Esperem que la teva cita hagi anat genial!</h2>
        <p>Hola ${nom},</p>
        <p>Ja ha finalitzat la teva cita de <strong>${serveiNom}</strong> del ${dataFormatada} a les ${horaFormatada}.</p>
        <p>Ens agradaria saber la teva opinió. La teva valoració ens ajuda a millorar el servei i a altres clients a triar-nos.</p>
        ${valoracioLink ? `
        <p style="margin-top:24px;">
          <a href="${valoracioLink}" style="display:inline-block;padding:14px 28px;background:#7C3AED;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
            Valorar la meva cita
          </a>
        </p>
        <p style="font-size:12px;color:#9CA3AF;margin-top:8px;">O copia aquest enllaç: ${valoracioLink}</p>
        ` : ''}
        <p>Gràcies per confiar en nosaltres. Fins aviat!</p>
      `,
    });
    if (error) throw new Error(`Resend: ${error.message}`);
  }
}
