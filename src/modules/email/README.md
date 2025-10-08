# Email Module

This module handles all email functionality for the Educational Management System, including email templates, configuration, and sending services.

## 📁 Structure

```
email/
├── config/
│   └── emailConfig.ts         # Nodemailer transporter configuration
├── services/
│   └── EmailService.ts         # Email sending service
├── templates/
│   ├── baseTemplate.ts         # Base HTML email template
│   └── verificationEmail.ts    # Verification email template
├── emails/
│   ├── sendVerificationEmail.ts    # Send verification email
│   └── sendPasswordResetEmail.ts   # Send password reset email
└── index.ts                    # Module exports
```

## 🚀 Features

- **Nodemailer Integration** - Production-ready email sending
- **Beautiful Templates** - Responsive HTML email templates
- **Type Safety** - Full TypeScript support
- **Error Handling** - Comprehensive error handling
- **Plain Text Fallback** - Auto-generated plain text versions

## ⚙️ Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME=Educational Management System

# Application
APP_NAME=Educational Management System
APP_URL=http://localhost:3000
```

### Gmail Setup

For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASSWORD`

## 📧 Usage

### Send Verification Email

```typescript
import { sendVerificationEmail } from '@/modules/email';

await sendVerificationEmail({
  email: 'user@example.com',
  userName: 'John Doe',
  verificationToken: 'token123',
});
```

### Send Password Reset Email

```typescript
import { sendPasswordResetEmail } from '@/modules/email';

await sendPasswordResetEmail({
  email: 'user@example.com',
  userName: 'John Doe',
  resetToken: 'reset123',
});
```

### Send Custom Email

```typescript
import { EmailService } from '@/modules/email';

await EmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our platform</h1>',
});
```

### Use Base Template

```typescript
import { baseEmailTemplate } from '@/modules/email';

const html = baseEmailTemplate({
  title: 'Welcome',
  content: '<p>Welcome to our platform!</p>',
  buttonText: 'Get Started',
  buttonUrl: 'https://example.com/start',
});
```

## 🎨 Email Templates

### Base Template Features

- Responsive design
- Gradient header
- Modern button styling
- Footer with links
- Mobile-friendly
- Email client compatible

### Custom Templates

Create new templates by extending the base template:

```typescript
import { baseEmailTemplate } from '../templates/baseTemplate';

const customEmail = baseEmailTemplate({
  title: 'Your Title',
  preheader: 'Preview text',
  content: '<p>Your content here</p>',
  buttonText: 'Click Me',
  buttonUrl: 'https://example.com',
  footerText: 'Custom footer text',
});
```

## 🔧 Email Service Methods

### `sendEmail(options)`

Send a single email.

```typescript
await EmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Subject',
  html: '<p>HTML content</p>',
  text: 'Plain text content', // Optional
});
```

### `sendBulkEmail(recipients, subject, html)`

Send email to multiple recipients.

```typescript
const { sent, failed } = await EmailService.sendBulkEmail(
  ['user1@example.com', 'user2@example.com'],
  'Subject',
  '<p>HTML content</p>'
);

console.log(`Sent: ${sent.length}, Failed: ${failed.length}`);
```

## 🧪 Testing

### Verify Email Configuration

```typescript
import { verifyEmailConfig } from '@/modules/email';

const isValid = await verifyEmailConfig();
console.log('Email config is valid:', isValid);
```

### Test Email Providers

For development, you can use services like:
- **Mailtrap.io** - Email testing
- **Ethereal Email** - Fake SMTP service
- **Gmail** - With app passwords

## 🛡️ Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use App Passwords** - Don't use actual email passwords
3. **Enable 2FA** - On your email account
4. **Rate Limiting** - Implement on email endpoints
5. **Validate Recipients** - Before sending emails

## 📝 Adding New Email Types

1. Create template in `templates/`:

```typescript
// templates/welcomeEmail.ts
export const generateWelcomeEmail = (userName: string) => {
  return baseEmailTemplate({
    title: 'Welcome!',
    content: `<p>Hello ${userName}!</p>`,
  });
};
```

2. Create send function in `emails/`:

```typescript
// emails/sendWelcomeEmail.ts
export const sendWelcomeEmail = async (email: string, userName: string) => {
  const html = generateWelcomeEmail(userName);
  await EmailService.sendEmail({
    to: email,
    subject: 'Welcome!',
    html,
  });
};
```

3. Export in `index.ts`:

```typescript
export { sendWelcomeEmail } from './emails/sendWelcomeEmail';
```

## 🐛 Troubleshooting

### Common Issues

**"Invalid login" error:**
- Check EMAIL_USER and EMAIL_PASSWORD
- Use App Password for Gmail
- Verify 2FA is enabled

**"Connection timeout":**
- Check EMAIL_HOST and EMAIL_PORT
- Verify firewall settings
- Try different port (465 for SSL)

**Emails going to spam:**
- Add SPF/DKIM records to domain
- Use verified sender address
- Avoid spam trigger words

## 📚 Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Email Template Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

**Note:** In production, consider using services like SendGrid, AWS SES, or Mailgun for better deliverability and scalability.
