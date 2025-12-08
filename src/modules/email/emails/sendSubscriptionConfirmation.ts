import { EmailService } from '../services/EmailService';
import { baseEmailTemplate } from '../templates/baseTemplate';
import { config } from '../../../config';

export interface SendSubscriptionConfirmationParams {
  email: string;
  firstName: string;
}

/**
 * Send subscription confirmation email to user after successful school fees payment
 */
export const sendSubscriptionConfirmation = async (
  params: SendSubscriptionConfirmationParams
): Promise<boolean> => {
  try {
    const { email, firstName } = params;

    const supportEmail = 'learning@cloudtopg.com';

    // Generate email content
    const content = `
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        <strong>Hey ${firstName},</strong>
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        Great news! your payment has been successfully received! 🎉
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        Your admission into the <strong>Cloud Top G School of Cloud Engineering, Cohort 2026 – The Next Generation Semester</strong> is now fully activated.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        You've officially secured your seat among the next generation of top 1% Cloud Engineers, and we couldn't be more excited to have you on board.
      </p>
      
      <p style="font-size: 18px; line-height: 1.8; color: #dc2626; font-weight: 600; margin: 30px 0 20px 0;">
        🌩️ What Happens Next
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        The next phase of your journey is the <strong>Onboarding Phase</strong>.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        During this period, our team will reach out to guide you through everything you need to settle in and start strong.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        You'll also receive an invitation to join our official <strong>Cloud Top G Slack channel</strong>.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        This is where all program communication, mentorship updates, and student announcements will take place; so once you're added, please stay active and engaged there.
      </p>
      
      <p style="font-size: 18px; line-height: 1.8; color: #dc2626; font-weight: 600; margin: 30px 0 20px 0;">
        📩 Stay Updated
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        While Slack will serve as your primary communication hub, please keep an eye on your Gmail inbox as well.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        We'll send important onboarding updates and next steps there, including your student setup details and community access links.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        If you have any questions at any point, don't hesitate to reach out to our Support Team at <a href="mailto:${supportEmail}" style="color: #dc2626; text-decoration: none;"><strong>${supportEmail}</strong></a>.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        We're thrilled to have you officially on board, <strong>${firstName}</strong>.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        The journey to your legacy career starts now — and this is only the beginning. 🌩️
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 30px 0 10px 0;">
        Warm regards,
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 0;">
        <strong>Cloud Top G Team</strong>
      </p>
    `;

    const html = baseEmailTemplate({
      title: `You're all set, ${firstName} — Here's what happens next 🚀`,
      preheader: `Great news! Your payment has been successfully received. Your Cloud Top G journey is now fully activated.`,
      content,
      footerText: `© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.`,
    });

    // Generate plain text version
    const text = `
Hey ${firstName},

Great news! your payment has been successfully received! 🎉

Your admission into the Cloud Top G School of Cloud Engineering, Cohort 2026 – The Next Generation Semester is now fully activated.

You've officially secured your seat among the next generation of top 1% Cloud Engineers, and we couldn't be more excited to have you on board.

🌩️ What Happens Next

The next phase of your journey is the Onboarding Phase.

During this period, our team will reach out to guide you through everything you need to settle in and start strong.

You'll also receive an invitation to join our official Cloud Top G Slack channel.

This is where all program communication, mentorship updates, and student announcements will take place; so once you're added, please stay active and engaged there.

📩 Stay Updated

While Slack will serve as your primary communication hub, please keep an eye on your Gmail inbox as well.

We'll send important onboarding updates and next steps there, including your student setup details and community access links.

If you have any questions at any point, don't hesitate to reach out to our Support Team at ${supportEmail}.

We're thrilled to have you officially on board, ${firstName}.

The journey to your legacy career starts now — and this is only the beginning. 🌩️

Warm regards,

Cloud Top G Team

---
© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.
    `.trim();

    // Send email
    await EmailService.sendEmail({
      to: email,
      subject: `You're all set, ${firstName} — Here's what happens next 🚀`,
      html,
      text,
    });

    console.log(`✅ Subscription confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending subscription confirmation email:', error);
    throw new Error('Failed to send subscription confirmation email');
  }
};
