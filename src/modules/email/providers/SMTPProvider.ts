import nodemailer from 'nodemailer';
import { config } from '../../../config';

export interface SMTPEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export class SMTPProvider {
  /**
   * Create nodemailer transporter
   */
  private static createTransporter() {
    return nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  /**
   * Send email via SMTP (Nodemailer)
   */
  static async sendEmail(params: SMTPEmailParams): Promise<boolean> {
    try {
      const transporter = this.createTransporter();
      const { to, subject, html, text } = params;

      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent via SMTP:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending email via SMTP:', error);
      throw new Error('Failed to send email via SMTP');
    }
  }

  /**
   * Verify SMTP configuration
   */
  static async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.createTransporter();
      await transporter.verify();
      console.log('✅ SMTP configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ SMTP configuration error:', error);
      return false;
    }
  }

  /**
   * Strip HTML tags to create plain text version
   */
  private static stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
