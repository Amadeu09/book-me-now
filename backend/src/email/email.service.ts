import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { IdPla, LLINDAR_AVIS, PLANS_CORREU, TipusCorreu } from './plans-correu';

const ERRORS_PERMANENTS = new Set<string>(['validation_error', 'invalid_parameter', 'missing_required_field']);

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  /** Per al comptador de quota: quin correu és i de quina empresa */
  tipus?: TipusCorreu;
  empresaId?: number | null;
}

/** Resultat d'un enviament: `permanent` vol dir que reintentar no servirà (adreça invàlida, etc.). */
export interface EmailResult {
  ok: boolean;
  permanent?: boolean;
  error?: string;
}

/**
 * Punt únic d'enviament d'emails (Resend).
 * Sense RESEND_API_KEY (tests, desenvolupament local) no envia res i ho registra.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  readonly pla: IdPla;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = config.get<string>('EMAIL_FROM') ?? '';
    this.pla = config.get<string>('RESEND_PLA') === 'pro' ? 'pro' : 'free';
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    const resultat = await this.enviar(message);
    if (this.resend) await this.registrar(message, resultat);
    return resultat;
  }

  private async enviar(message: EmailMessage): Promise<EmailResult> {
    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY no configurada: no s'envia "${message.subject}"`);
      return { ok: false, permanent: false, error: 'RESEND_API_KEY no configurada' };
    }
    const { tipus: _tipus, empresaId: _empresaId, ...correu } = message;
    try {
      const { error } = await this.resend.emails.send({ from: this.from, ...correu });
      if (error) {
        // Només els errors del propi missatge (adreça invàlida, camps) són definitius;
        // quota, clau o errors interns es poden resoldre i val la pena reintentar.
        const permanent = ERRORS_PERMANENTS.has(error.name);
        this.logger.error(`Resend ha rebutjat "${message.subject}": ${error.name} ${error.message}`);
        return { ok: false, permanent, error: error.message };
      }
      return { ok: true };
    } catch (err) {
      // Error de xarxa o similar: es pot tornar a intentar
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error enviant "${message.subject}": ${msg}`);
      return { ok: false, permanent: false, error: msg };
    }
  }

  /** Desa l'enviament per al comptador i, si cal, avisa el superadmin. Mai llança. */
  private async registrar(message: EmailMessage, resultat: EmailResult) {
    try {
      const destinataris = Array.isArray(message.to) ? message.to.length : 1;
      await this.prisma.correuEnviat.create({
        data: {
          tipus: message.tipus ?? 'ALTRES',
          empresaId: message.empresaId ?? null,
          destinataris,
          ok: resultat.ok,
          error: resultat.ok ? null : (resultat.error ?? '').slice(0, 300),
        },
      });
      if (resultat.ok && message.tipus !== 'ALERTA_QUOTA') await this.comprovarQuota();
    } catch (err) {
      this.logger.error(`No s'ha pogut registrar el correu: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /** Correus comptats per Resend (un per destinatari) des d'una data. */
  async comptarDes(des: Date): Promise<number> {
    const r = await this.prisma.correuEnviat.aggregate({ where: { ok: true, createdAt: { gte: des } }, _sum: { destinataris: true } });
    return r._sum.destinataris ?? 0;
  }

  /** En passar del 80 % del límit del dia o del mes, avisa els superadmins (un sol cop per període). */
  private async comprovarQuota() {
    const pla = PLANS_CORREU[this.pla];
    const ara = new Date();
    const iniciDia = new Date(Date.UTC(ara.getUTCFullYear(), ara.getUTCMonth(), ara.getUTCDate()));
    const iniciMes = new Date(Date.UTC(ara.getUTCFullYear(), ara.getUTCMonth(), 1));
    const periodes: { nom: 'dia' | 'mes'; limit: number | null; des: Date; clau: string }[] = [
      { nom: 'dia', limit: pla.limitDia, des: iniciDia, clau: iniciDia.toISOString().slice(0, 10) },
      { nom: 'mes', limit: pla.limitMes, des: iniciMes, clau: iniciMes.toISOString().slice(0, 7) },
    ];
    for (const p of periodes) {
      if (!p.limit) continue;
      const usats = await this.comptarDes(p.des);
      if (usats < p.limit * LLINDAR_AVIS) continue;
      const { count } = await this.prisma.avisQuota.createMany({
        data: [{ clau: `${pla.id}:${p.nom}:${p.clau}:80` }],
        skipDuplicates: true,
      });
      if (count === 0) continue; // ja s'havia avisat
      const admins = await this.prisma.superAdmin.findMany({ select: { email: true } });
      if (admins.length === 0) continue;
      const pct = Math.round((usats / p.limit) * 100);
      this.logger.warn(`Quota de correus al ${pct}% (${p.nom}): ${usats}/${p.limit}`);
      await this.send({
        tipus: 'ALERTA_QUOTA',
        to: admins.map((a) => a.email),
        subject: `BookMeNow: correus al ${pct}% del límit ${p.nom === 'dia' ? 'diari' : 'mensual'}`,
        html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#14142B">
          <h2 style="margin:0 0 12px">Quota de correus al ${pct}%</h2>
          <p>S'han enviat <b>${usats}</b> de <b>${p.limit}</b> correus ${p.nom === 'dia' ? "avui (dia UTC)" : 'aquest mes'} amb el pla ${pla.nom} de Resend.</p>
          <p>${pla.excesPer1000 === null ? "Si s'arriba al límit, Resend aturarà els enviaments fins al següent període." : "Per sobre del límit es cobra l'excés."} Revisa el detall al panell d'administració.</p>
        </div>`,
      });
    }
  }

  /** Enviament en segon pla: no bloqueja la resposta HTTP i mai llança. */
  sendInBackground(message: EmailMessage): void {
    void this.send(message);
  }
}
