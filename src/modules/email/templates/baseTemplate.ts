import { config } from '../../../config';

export interface EmailTemplateData {
  title: string;
  preheader?: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
}

/**
 * Base email template with modern, responsive design
 */
export const baseEmailTemplate = (data: EmailTemplateData): string => {
  const {
    title,
    preheader = '',
    content,
    buttonText,
    buttonUrl,
    footerText = `© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.`,
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
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
    
    /* Logo Header */
    .logo-header {
      background-color: #ffffff;
      padding: 25px 20px 15px 20px;
      text-align: right;
    }
    .logo-header img {
      max-width: 120px;
      height: auto;
      display: block;
      margin-left: auto;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    /* Content */
    .content {
      background-color: #ffffff;
      padding: 40px 30px;
    }
    .content h2 {
      color: #dc2626;
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .content p {
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    
    /* Button */
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 40px;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    .button:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
    
    /* Mobile Button (for inline buttons in content) */
    .mobile-button {
      display: inline-block;
      padding: 14px 40px;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      box-sizing: border-box;
    }
    
    /* Footer */
    .footer {
      background-color: #fef2f2;
      padding: 30px 20px;
      text-align: center;
    }
    .footer p {
      color: #6b7280;
      font-size: 14px;
      line-height: 1.6;
      margin: 5px 0;
    }
    .footer a {
      color: #dc2626;
      text-decoration: none;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .logo-header {
        padding: 20px 15px 10px 15px !important;
      }
      .logo-header img {
        max-width: 100px !important;
      }
      .content {
        padding: 30px 20px !important;
      }
      .content h2 {
        font-size: 20px !important;
      }
      .content p {
        font-size: 15px !important;
        line-height: 1.6 !important;
      }
      .content ul,
      .content ol {
        padding-left: 15px !important;
      }
      .content li {
        margin-bottom: 10px !important;
        font-size: 15px !important;
      }
      .bonus-list-container {
        padding: 15px !important;
        margin: 20px 0 !important;
      }
      .bonus-list {
        padding-left: 15px !important;
        font-size: 15px !important;
        line-height: 1.8 !important;
      }
      .bonus-list li {
        margin-bottom: 12px !important;
        font-size: 15px !important;
      }
      .button-container {
        margin: 25px 0 !important;
      }
      .button {
        display: block !important;
        width: 100% !important;
        padding: 14px 20px !important;
        font-size: 15px !important;
        box-sizing: border-box !important;
      }
      .mobile-button {
        display: block !important;
        width: 100% !important;
        padding: 14px 20px !important;
        font-size: 15px !important;
        box-sizing: border-box !important;
        text-align: center !important;
      }
      .footer {
        padding: 25px 15px !important;
      }
      .footer p {
        font-size: 13px !important;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ''}
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" class="email-container" width="600">
          
          <!-- Logo Header -->
          <tr>
            <td class="logo-header">
              <img src="https://znzcgxxkbxnjowiqregs.supabase.co/storage/v1/object/public/assets/LOGO-2.png" alt="${config.app.name} Logo" style="max-width: 120px; height: auto; display: block; margin-left: auto;" />
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content">
              
              ${content}
              ${buttonText && buttonUrl ? `
              <div class="button-container">
                <a href="${buttonUrl}" class="button" target="_blank">${buttonText}</a>
              </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p>${footerText}</p>
              <p>
                <a href="https://cloudtopg.com">Visit our website</a> | 
                <a href="${config.app.url}">Support</a> | 
                <a href="https://cloudtopg.com/privacy-policy">Privacy Policy</a>
              </p>
              <p style="margin-top: 15px; color: #999999; font-size: 12px;">
                If you didn't request this email, please ignore it.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
