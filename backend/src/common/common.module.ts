import { Global, Module } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { SessionCacheService } from '../auth/session-cache.service';

/** Serveis compartits per tots els mòduls (una sola instància a tota l'app). */
@Global()
@Module({
  providers: [EmailService, SessionCacheService],
  exports: [EmailService, SessionCacheService],
})
export class CommonModule {}
