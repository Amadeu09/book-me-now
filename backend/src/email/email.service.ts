import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

const ERRORS_PERMANENTS = new Set<string>(['validation_error', 'invalid_parameter', 'missing_required_field']);

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
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

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = config.get<string>('EMAIL_FROM') ?? '';
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY no configurada: no s'envia "${message.subject}"`);
      return { ok: false, permanent: false, error: 'RESEND_API_KEY no configurada' };
    }
    try {
      const { error } = await this.resend.emails.send({ from: this.from, ...message });
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

  /** Enviament en segon pla: no bloqueja la resposta HTTP i mai llança. */
  sendInBackground(message: EmailMessage): void {
    void this.send(message);
  }
}
