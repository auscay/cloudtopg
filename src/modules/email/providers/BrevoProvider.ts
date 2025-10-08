import axios from 'axios';
import { config } from '../../../config';

export interface BrevoEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  senderName?: string;
  senderEmail?: string;
}

export class BrevoProvider {
  /**
   * Send email via Brevo API
   */
  static async sendEmail(params: BrevoEmailParams): Promise<boolean> {
    try {
      const { to, subject, html, text, senderName, senderEmail } = params;

      // Prepare recipients
      const recipients = Array.isArray(to) 
        ? to.map(email => ({ email }))
        : [{ email: to }];

      const response = await axios.post(
        config.email.brevo.apiUrl,
        {
          sender: {
            name: senderName || config.email.fromName,
            email: senderEmail || config.email.from,
          },
          to: recipients,
          subject,
          htmlContent: html,
          textContent: text,
        },
        {
          headers: {
            Accept: 'application/json',
            'api-key': config.email.brevo.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Email sent via Brevo:', response.data.messageId);
      return response.status === 201;
    } catch (error) {
      console.error('❌ Error sending email via Brevo:', error);
      if (axios.isAxiosError(error)) {
        console.error('Brevo API Error:', error.response?.data);
      }
      throw new Error('Failed to send email via Brevo');
    }
  }

  /**
   * Verify Brevo API key
   */
  static async verifyApiKey(): Promise<boolean> {
    try {
      const response = await axios.get('https://api.brevo.com/v3/account', {
        headers: {
          'api-key': config.email.brevo.apiKey,
        },
      });
      console.log('✅ Brevo API key is valid');
      return response.status === 200;
    } catch (error) {
      console.error('❌ Brevo API key verification failed:', error);
      return false;
    }
  }
}
