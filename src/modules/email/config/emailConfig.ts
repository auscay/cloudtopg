import nodemailer from 'nodemailer';
import { config } from '../../../config';

/**
 * Create nodemailer transporter
 */
export const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

/**
 * Email sender information
 */
export const getEmailFrom = () => {
  return {
    name: config.email.fromName,
    address: config.email.from,
  };
};
