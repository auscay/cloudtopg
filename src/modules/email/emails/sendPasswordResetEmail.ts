import { EmailService } from '../services/EmailService';
import { baseEmailTemplate } from '../templates/baseTemplate';
import { config } from '../../../config';

export interface SendPasswordResetEmailParams {
  email: string;
  userName: string;
  resetToken: string;
}

/**
 * Send password reset email to user
 */
export const sendPasswordResetEmail = async (
  params: SendPasswordResetEmailParams
): Promise<boolean> => {
  try {
    const { email, userName, resetToken } = params;

    // Create reset URL
    const resetUrl = `${config.app.url}/reset-password?token=${resetToken}`;

    // Generate email content
    const content = `
      <p>Hello <strong>${userName}</strong>,</p>
      <p>We received a request to reset your password for your ${config.app.name} account.</p>
      <p>To reset your password, please click the button below:</p>
      <p style="margin-top: 30px; font-size: 14px; color: #777;">
        This password reset link will expire in <strong>1 hour</strong>. 
        If you didn't request a password reset, you can safely ignore this email.
      </p>
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px;">
          <strong>Security Tip:</strong> Never share this link with anyone. 
          Our team will never ask for your password.
        </p>
      </div>
    `;

    const html = baseEmailTemplate({
      title: 'Reset Your Password',
      preheader: 'Reset your password to regain access to your account',
      content,
      buttonText: 'Reset Password',
      buttonUrl: resetUrl,
    });

    // Generate plain text version
    const text = `
Hello ${userName},

We received a request to reset your password for your ${config.app.name} account.

To reset your password, please click the link below:

${resetUrl}

This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.

Security Tip: Never share this link with anyone. Our team will never ask for your password.

Best regards,
${config.app.name} Team

---
© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.
    `.trim();

    // Send email
    await EmailService.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html,
      text,
    });

    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};
