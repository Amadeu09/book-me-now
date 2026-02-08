import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private blacklistedTokens: Set<string> = new Set();

  /**
   * Add token to blacklist
   */
  addToBlacklist(token: string, expiresAt: Date): void {
    this.blacklistedTokens.add(token);
    this.logger.debug(`Token added to blacklist. Total blacklisted: ${this.blacklistedTokens.size}`);

    // Set timeout to remove token from blacklist when it expires
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    if (timeUntilExpiry > 0) {
      setTimeout(() => {
        this.removeFromBlacklist(token);
      }, timeUntilExpiry);
    }
  }

  /**
   * Check if token is blacklisted
   */
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Remove token from blacklist
   */
  private removeFromBlacklist(token: string): void {
    this.blacklistedTokens.delete(token);
    this.logger.debug(`Token removed from blacklist. Total blacklisted: ${this.blacklistedTokens.size}`);
  }

  /**
   * Clear all blacklisted tokens (useful for testing)
   */
  clearBlacklist(): void {
    this.blacklistedTokens.clear();
    this.logger.debug('Blacklist cleared');
  }
}
