// Email service
export { EmailService, SendEmailOptions } from './services/EmailService';

// Email providers
export { SMTPProvider } from './providers/SMTPProvider';
export { BrevoProvider } from './providers/BrevoProvider';
export { SendGridProvider } from './providers/SendGridProvider';

// Email templates
export { baseEmailTemplate, EmailTemplateData } from './templates/baseTemplate';
export { generateVerificationEmail, generateVerificationEmailText } from './templates/verificationEmail';

// Email functions
export { sendVerificationEmail, SendVerificationEmailParams } from './emails/sendVerificationEmail';
export { sendPasswordResetEmail, SendPasswordResetEmailParams } from './emails/sendPasswordResetEmail';
export { sendWelcomeEmail, SendWelcomeEmailParams } from './emails/sendWelcomeEmail';
export { sendApplicationFeeConfirmation, SendApplicationFeeConfirmationParams } from './emails/sendApplicationFeeConfirmation';
export { sendSubscriptionConfirmation, SendSubscriptionConfirmationParams } from './emails/sendSubscriptionConfirmation';
