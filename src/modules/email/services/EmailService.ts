import { config } from '../../../config';
import { SMTPProvider } from '../providers/SMTPProvider';
import { BrevoProvider } from '../providers/BrevoProvider';
import { SendGridProvider } from '../providers/SendGridProvider';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Send email using configured provider
   */
  static async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const provider = config.email.provider;

      switch (provider) {
        case 'brevo':
          return await BrevoProvider.sendEmail(options);
        
        case 'sendgrid':
          return await SendGridProvider.sendEmail(options);
        
        case 'smtp':
        default:
          return await SMTPProvider.sendEmail(options);
      }
    } catch (error) {
      console.error(`❌ Error sending email via ${config.email.provider}:`, error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Verify email configuration for current provider
   */
  static async verifyConfiguration(): Promise<boolean> {
    const provider = config.email.provider;

    switch (provider) {
      case 'brevo':
        return await BrevoProvider.verifyApiKey();
      
      case 'sendgrid':
        return await SendGridProvider.verifyApiKey();
      
      case 'smtp':
      default:
        return await SMTPProvider.verifyConnection();
    }
  }

  /**
   * Send email to multiple recipients
   */
  static async sendBulkEmail(
    recipients: string[],
    subject: string,
    html: string
  ): Promise<{ sent: string[]; failed: string[] }> {
    const sent: string[] = [];
    const failed: string[] = [];

    for (const recipient of recipients) {
      try {
        await this.sendEmail({
          to: recipient,
          subject,
          html,
        });
        sent.push(recipient);
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        failed.push(recipient);
      }
    }

    return { sent, failed };
  }
}
