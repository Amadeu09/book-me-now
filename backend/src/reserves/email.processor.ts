import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface PostCitaJobData {
  email: string;
  nom: string;
  serveiNom: string;
  dataHoraInici: string;
  tokenValoracio?: string;
}

@Processor('emails')
export class EmailProcessor {
  private readonly resend: Resend;
  private readonly emailFrom: string;
  private readonly portalUrl: string;

  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.emailFrom = this.config.get<string>('EMAIL_FROM');
    this.portalUrl = this.config.get<string>('PORTAL_URL', 'http://localhost:3002');
  }

  @Process('post-cita')
  async handlePostCita(job: Job<PostCitaJobData>): Promise<void> {
    const { email, nom, serveiNom, dataHoraInici, tokenValoracio } = job.data;
    const data = new Date(dataHoraInici);
    const dataFormatada = data.toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const horaFormatada = data.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });

    const valoracioLink = tokenValoracio ? `${this.portalUrl}/valoracio/${tokenValoracio}` : null;

    await this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: `Com ha anat la teva cita de ${serveiNom}?`,
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
  }
}
