import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);

  constructor(private readonly prisma: PrismaService) {}

  async addToBlacklist(token: string, expiresAt: Date): Promise<void> {
    await this.prisma.tokenBlacklist.upsert({
      where: { token },
      create: { token, expiresAt },
      update: { expiresAt },
    });
    this.logger.debug('Token added to blacklist');
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const entry = await this.prisma.tokenBlacklist.findUnique({
      where: { token },
    });
    if (!entry) return false;
    // Treat expired blacklist entries as if they don't exist
    if (entry.expiresAt < new Date()) {
      return false;
    }
    return true;
  }

  /** Esborra cada nit els tokens de logout ja caducats. */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async purgeExpired(): Promise<void> {
    const { count } = await this.prisma.tokenBlacklist.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.debug(`Purged ${count} expired blacklist entries`);
  }
}
