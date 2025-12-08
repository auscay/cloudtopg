import { EmailService } from '../services/EmailService';
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

    // Extract firstName from userName (format: "FirstName LastName")
    const firstName = userName.split(' ')[0] || userName;

    // Generate email HTML without header
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your Email Address</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    /* Reset styles */
    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    
    /* Base styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333333;
    }
    
    /* Container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    /* Content */
    .content {
      background-color: #ffffff;
      padding: 40px 30px;
    }
    .content h2 {
      color: #1f2937;
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .content p {
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    
    /* Verification Code Box - Black with White Text */
    .verification-code-box {
      background-color: #000000;
      padding: 30px;
      border-radius: 8px;
      margin: 30px 0;
      text-align: center;
    }
    .verification-code {
      font-size: 48px;
      font-weight: bold;
      color: #ffffff;
      letter-spacing: 10px;
      font-family: 'Courier New', monospace;
      margin: 0;
    }
    
    /* Footer */
    .footer {
      background-color: #f9fafb;
      padding: 30px 20px;
      text-align: center;
    }
    .footer p {
      color: #6b7280;
      font-size: 14px;
      line-height: 1.6;
      margin: 5px 0;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .content {
        padding: 30px 20px !important;
      }
      .verification-code {
        font-size: 36px;
        letter-spacing: 5px;
      }
    }
  </style>
</head>
<body>
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" class="email-container" width="600">
          
          <!-- Content -->
          <tr>
            <td class="content">
              <h2>Verify Your Email Address</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                Hi <strong>${firstName}</strong>,
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                Welcome to ${config.app.name}, where every tool, every skill, every step builds legacy careers.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                To complete your registration and verify your email address, please use the verification code below.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                To keep your account secure and activate your access, please verify your email using the code below:
              </p>
              
              <!-- Verification Code Box -->
              <div class="verification-code-box">
                <p class="verification-code">${verificationCode}</p>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
                Verification code will expire soon.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                Enter this code on the verification page to complete your sign-up.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                If you didn't sign up for a ${config.app.name} account, you can safely ignore this message.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-top: 30px; margin-bottom: 10px;">
                Thanks,
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 0;">
                <strong>${config.app.name} Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p>© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Generate plain text version
    const text = `
Verify Your Email Address

Hi ${firstName},

Welcome to ${config.app.name}, where every tool, every skill, every step builds legacy careers.

To complete your registration and verify your email address, please use the verification code below.

To keep your account secure and activate your access, please verify your email using the code below:

VERIFICATION CODE: ${verificationCode}

Verification code will expire soon.

Enter this code on the verification page to complete your sign-up.

If you didn't sign up for a ${config.app.name} account, you can safely ignore this message.

Thanks,

${config.app.name} Team

---
© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.
    `.trim();

    // Send email
    await EmailService.sendEmail({
      to: email,
      subject: `${verificationCode} is your ${config.app.name} verification code`,
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
