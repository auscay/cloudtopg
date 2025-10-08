import { baseEmailTemplate } from './baseTemplate';
import { config } from '../../../config';

export interface VerificationEmailData {
  userName: string;
  verificationUrl: string;
  verificationCode?: string;
}

/**
 * Generate email verification email HTML
 */
export const generateVerificationEmail = (data: VerificationEmailData): string => {
  const { userName, verificationUrl, verificationCode } = data;

  const content = `
    <p>Hello <strong>${userName}</strong>,</p>
    <p>Thank you for registering with ${config.app.name}! We're excited to have you on board.</p>
    <p>To complete your registration and verify your email address, please click the button below:</p>
    ${verificationCode ? `
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #777;">Your verification code:</p>
        <p style="margin: 0; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${verificationCode}</p>
      </div>
      <p style="font-size: 14px; color: #777;">Or click the button below to verify automatically:</p>
    ` : ''}
    <p style="margin-top: 30px; font-size: 14px; color: #777;">
      This verification link will expire in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
    </p>
  `;

  return baseEmailTemplate({
    title: 'Verify Your Email Address',
    preheader: 'Complete your registration by verifying your email address',
    content,
    buttonText: 'Verify Email Address',
    buttonUrl: verificationUrl,
  });
};

/**
 * Generate plain text version of verification email
 */
export const generateVerificationEmailText = (data: VerificationEmailData): string => {
  const { userName, verificationUrl, verificationCode } = data;

  return `
Hello ${userName},

Thank you for registering with ${config.app.name}! We're excited to have you on board.

To complete your registration and verify your email address, please click the link below:

${verificationUrl}

${verificationCode ? `Or use this verification code: ${verificationCode}\n\n` : ''}
This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.

Best regards,
${config.app.name} Team

---
© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.
  `.trim();
};
