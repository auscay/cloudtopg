import axios from 'axios';
import { config } from '../../../config';

export interface SendGridEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  senderName?: string;
  senderEmail?: string;
}

export class SendGridProvider {
  /**
   * Send email via SendGrid API
   */
  static async sendEmail(params: SendGridEmailParams): Promise<boolean> {
    try {
      const { to, subject, html, text, senderName, senderEmail } = params;

      // Prepare recipients
      const personalizations = [{
        to: Array.isArray(to) 
          ? to.map(email => ({ email }))
          : [{ email: to }],
      }];

      const response = await axios.post(
        config.email.sendgrid.apiUrl,
        {
          personalizations,
          from: {
            name: senderName || config.email.fromName,
            email: senderEmail || config.email.from,
          },
          subject,
          content: [
            {
              type: 'text/html',
              value: html,
            },
            ...(text ? [{
              type: 'text/plain',
              value: text,
            }] : []),
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${config.email.sendgrid.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Email sent via SendGrid');
      return response.status === 202;
    } catch (error: any) {
      console.error('❌ Error sending email via SendGrid:', error);
      if (axios.isAxiosError(error)) {
        console.error('SendGrid API Error:', error.response?.data);
      }
      throw new Error('Failed to send email via SendGrid');
    }
  }

  /**
   * Verify SendGrid API key
   */
  static async verifyApiKey(): Promise<boolean> {
    try {
      const response = await axios.get('https://api.sendgrid.com/v3/scopes', {
        headers: {
          Authorization: `Bearer ${config.email.sendgrid.apiKey}`,
        },
      });
      console.log('✅ SendGrid API key is valid');
      return response.status === 200;
    } catch (error) {
      console.error('❌ SendGrid API key verification failed:', error);
      return false;
    }
  }
}
