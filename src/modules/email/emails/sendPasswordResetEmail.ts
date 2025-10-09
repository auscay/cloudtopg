import { EmailService } from '../services/EmailService';
import { baseEmailTemplate } from '../templates/baseTemplate';
import { config } from '../../../config';

export interface SendPasswordResetEmailParams {
  email: string;
  userName: string;
  resetCode: string;
}

/**
 * Send password reset email to user with 6-digit code
 */
export const sendPasswordResetEmail = async (
  params: SendPasswordResetEmailParams
): Promise<boolean> => {
  try {
    const { email, userName, resetCode } = params;

    // Generate email content
    const content = `
      <p>Hello <strong>${userName}</strong>,</p>
      <p>We received a request to reset your password for your ${config.app.name} account.</p>
      <p>To reset your password, please use the code below:</p>
      
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #ffffff; opacity: 0.9;">Your password reset code:</p>
        <p style="margin: 0; font-size: 48px; font-weight: bold; color: #ffffff; letter-spacing: 10px; font-family: 'Courier New', monospace;">${resetCode}</p>
      </div>
      
      <p style="font-size: 14px; color: #777;">
        This password reset code will expire in <strong>1 hour</strong>. 
        If you didn't request a password reset, you can safely ignore this email.
      </p>
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px;">
          <strong>Security Tip:</strong> Never share this code with anyone. 
          Our team will never ask for your password.
        </p>
      </div>
    `;

    const html = baseEmailTemplate({
      title: 'Reset Your Password',
      preheader: `Your password reset code is ${resetCode}`,
      content,
    });

    // Generate plain text version
    const text = `
Hello ${userName},

We received a request to reset your password for your ${config.app.name} account.

To reset your password, please use the code below:

PASSWORD RESET CODE: ${resetCode}

This password reset code will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.

Security Tip: Never share this code with anyone. Our team will never ask for your password.

Best regards,
${config.app.name} Team

---
© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.
    `.trim();

    // Send email
    await EmailService.sendEmail({
      to: email,
      subject: `Your Password Reset Code: ${resetCode}`,
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
