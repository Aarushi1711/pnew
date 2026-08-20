import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

// resend.dev's shared sending domain works for any RESEND_API_KEY with no
// domain verification required, so this is a safe zero-config default;
// RESEND_FROM_EMAIL can override it once a verified sending domain exists.
const DEFAULT_FROM_ADDRESS = 'Traverse <onboarding@resend.dev>';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly client: Resend;
  private readonly fromAddress: string;

  constructor(config: ConfigService) {
    this.client = new Resend(config.get<string>('RESEND_API_KEY'));
    this.fromAddress =
      config.get<string>('RESEND_FROM_EMAIL') ?? DEFAULT_FROM_ADDRESS;
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    this.logger.log(`Sending password reset email via Resend to ${to}`);

    const { error } = await this.client.emails.send({
      from: this.fromAddress,
      to,
      subject: 'Reset your Traverse password',
      html: `
        <p>We got a request to reset your Traverse password.</p>
        <p><a href="${resetUrl}">Click here to choose a new password</a>. This link expires in 15 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    if (error) {
      this.logger.error(
        `Resend failed to send password reset email: ${JSON.stringify(error)}`,
      );
      throw new InternalServerErrorException(
        'Failed to send password reset email',
      );
    }
  }
}
