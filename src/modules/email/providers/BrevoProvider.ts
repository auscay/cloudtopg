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
   * Send email via Brevo API with retry logic
   */
  static async sendEmail(params: BrevoEmailParams, retries = 3): Promise<boolean> {
    const { to, subject, html, text, senderName, senderEmail } = params;

    // Prepare recipients
    const recipients = Array.isArray(to) 
      ? to.map(email => ({ email }))
      : [{ email: to }];

    const requestData = {
      sender: {
        name: senderName || config.email.fromName,
        email: senderEmail || config.email.from,
      },
      to: recipients,
      subject,
      htmlContent: html,
      textContent: text,
    };

    const requestConfig = {
      headers: {
        Accept: 'application/json',
        'api-key': config.email.brevo.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    };

    // Retry logic for transient network errors
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(
          config.email.brevo.apiUrl,
          requestData,
          requestConfig
        );

        console.log('✅ Email sent via Brevo:', response.data.messageId);
        return response.status === 201;
      } catch (error) {
        const isLastAttempt = attempt === retries;
        const isNetworkError = axios.isAxiosError(error) && (
          error.code === 'EAI_AGAIN' || // DNS resolution error
          error.code === 'ECONNRESET' || // Connection reset
          error.code === 'ETIMEDOUT' || // Timeout
          error.code === 'ENOTFOUND' || // DNS not found
          !error.response // No response (network error)
        );

        if (isNetworkError && !isLastAttempt) {
          // Exponential backoff: wait 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.warn(`⚠️ Network error on attempt ${attempt}/${retries}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // If it's the last attempt or not a network error, throw
        console.error(`❌ Error sending email via Brevo (attempt ${attempt}/${retries}):`, error);
        if (axios.isAxiosError(error)) {
          console.error('Brevo API Error:', error.response?.data || error.message);
          if (error.response) {
            // API error (not network error)
            throw new Error(`Failed to send email via Brevo: ${error.response.status} ${JSON.stringify(error.response.data)}`);
          }
        }
        throw new Error(`Failed to send email via Brevo: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    throw new Error('Failed to send email via Brevo after all retries');
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
