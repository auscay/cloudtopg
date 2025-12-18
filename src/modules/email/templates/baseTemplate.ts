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
      text-align: left;
    }
    .logo-header img {
      max-width: 120px;
      height: auto;
      display: block;
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
      .button {
        display: block !important;
        width: 100% !important;
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
              <img src="https://res.cloudinary.com/dysloawon/image/upload/v1766030923/unnamed_1_y7xqwk.jpg" alt="${config.app.name} Logo" style="max-width: 120px; height: auto; display: block;" />
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content">
              <h2>${title}</h2>
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
                <a href="${config.app.url}">Visit our website</a> | 
                <a href="${config.app.url}/support">Support</a> | 
                <a href="${config.app.url}/privacy">Privacy Policy</a>
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
