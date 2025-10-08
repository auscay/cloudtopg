import { EmailService } from '../services/EmailService';
import { baseEmailTemplate } from '../templates/baseTemplate';
import { config } from '../../../config';

export interface SendVerificationEmailParams {
  email: string;
  userName: string;
  verificationCode: string;
}

/**
 * Send verification email to user with 6-digit code
 */
export const sendVerificationEmail = async (
  params: SendVerificationEmailParams
): Promise<boolean> => {
  try {
    const { email, userName, verificationCode } = params;

    // Generate email content
    const content = `
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Thank you for registering with ${config.app.name}! We're excited to have you on board.</p>
      <p>To complete your registration and verify your email address, please use the verification code below:</p>
      
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #ffffff; opacity: 0.9;">Your verification code:</p>
        <p style="margin: 0; font-size: 48px; font-weight: bold; color: #ffffff; letter-spacing: 10px; font-family: 'Courier New', monospace;">${verificationCode}</p>
      </div>
      
      <p style="font-size: 14px; color: #777;">
        This verification code will expire in <strong>24 hours</strong>. 
        If you didn't create an account, you can safely ignore this email.
      </p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px;">
          <strong>Security Tip:</strong> Never share this code with anyone. 
          Our team will never ask for your verification code.
        </p>
      </div>
    `;

    const html = baseEmailTemplate({
      title: 'Verify Your Email Address',
      preheader: `Your verification code is ${verificationCode}`,
      content,
    });

    // Generate plain text version
    const text = `
Hello ${userName},

Thank you for registering with ${config.app.name}! We're excited to have you on board.

To complete your registration and verify your email address, please use the verification code below:

VERIFICATION CODE: ${verificationCode}

This verification code will expire in 24 hours. If you didn't create an account, you can safely ignore this email.

Security Tip: Never share this code with anyone. Our team will never ask for your verification code.

Best regards,
${config.app.name} Team

---
© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.
    `.trim();

    // Send email
    await EmailService.sendEmail({
      to: email,
      subject: `Your Verification Code: ${verificationCode}`,
      html,
      text,
    });

    console.log(`✅ Verification email with code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
