import { EmailService } from '../services/EmailService';
import { baseEmailTemplate } from '../templates/baseTemplate';
import { config } from '../../../config';

export interface SendApplicationFeeConfirmationParams {
  email: string;
  firstName: string;
}

/**
 * Send application fee confirmation email to user after successful payment
 */
export const sendApplicationFeeConfirmation = async (
  params: SendApplicationFeeConfirmationParams
): Promise<boolean> => {
  try {
    const { email, firstName } = params;

    const supportEmail = 'support@cloudtopg.com';
    const portalUrl = `${config.app.url}/student` || config.app.url;

    // Generate email content
    const content = `
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        <strong>Hey ${firstName},</strong>
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        Congratulations — your application has been received! 🎉
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        You've officially taken the first bold step toward joining the Cloud Top G community and building your legacy career. We're excited to have you on board.
      </p>
      
      <p style="font-size: 18px; line-height: 1.8; color: #dc2626; font-weight: 600; margin: 30px 0 20px 0;">
        So, what's next on your journey?
      </p>
      
      <p style="font-size: 20px; line-height: 1.8; color: #1f2937; font-weight: 600; margin-bottom: 20px;">
        The Cloud Top G Assessment!
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        The next milestone in your journey is the <strong>Cloud Top G Assessment</strong>, a short but essential test designed to help us understand your foundation, learning style, and readiness for the program.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        This assessment is a must for every applicant; it ensures we can guide you with the right structure, mentorship, and support from day one.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        To help you prepare, your <strong>Study Kit</strong> is now available in your Cloud Top G portal.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${portalUrl}" class="mobile-button" target="_blank" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-sizing: border-box; max-width: 100%;">Access Your Portal →</a>
      </div>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        It's designed to give you the focus and confidence you need to perform at your best.
      </p>
      
      <div style="background-color: #f9fafb; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
          🗓️ Important Details to Note:
        </p>
        <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 16px; line-height: 2;">
          <li style="margin-bottom: 10px;">
            You'll have <strong>10 days in total</strong> — 7 days to prepare with your Study Kit, and a 3-day window to complete your assessment.
          </li>
          <li style="margin-bottom: 10px;">
            The assessment must be taken in <strong>one sitting</strong> — once started, it must be completed without breaks or retries.
          </li>
          <li style="margin-bottom: 0;">
            Passing this assessment is a <strong>crucial part</strong> of your Cloud Top G enrollment process.
          </li>
        </ul>
      </div>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        We recommend setting aside a calm environment and your full attention, this short window is your opportunity to show what's possible when focus meets preparation.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        If you need more information about the program or have any further questions, our Support Team is always available at <a href="mailto:${supportEmail}" style="color: #dc2626; text-decoration: none;"><strong>${supportEmail}</strong></a>.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        And remember, this assessment isn't about perfection. It's about potential.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        So take your time, use your Study Kit well, and get ready to show us what you're capable of.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 30px 0 10px 0;">
        Warm regards,
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        <strong>Cloud Top G</strong>
      </p>
      
      <p style="font-size: 14px; line-height: 1.8; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <strong>P.S.</strong> You've already proven you're serious about growth. Now it's time to back it up with action. The assessment is where your Cloud Top G story truly begins.
      </p>
    `;

    const html = baseEmailTemplate({
      title: `Welcome ${firstName}, Your Cloud Top G Journey Is Officially Underway`,
      preheader: `Congratulations! Your application has been received. Your Cloud Top G journey starts now.`,
      content,
      footerText: `© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.`,
    });

    // Generate plain text version
    const text = `
Hey ${firstName},

Congratulations — your application has been received! 🎉

You've officially taken the first bold step toward joining the Cloud Top G community and building your legacy career. We're excited to have you on board.

So, what's next on your journey?

The Cloud Top G Assessment!

The next milestone in your journey is the Cloud Top G Assessment, a short but essential test designed to help us understand your foundation, learning style, and readiness for the program.

This assessment is a must for every applicant; it ensures we can guide you with the right structure, mentorship, and support from day one.

To help you prepare, your Study Kit is now available in your Cloud Top G portal.

It's designed to give you the focus and confidence you need to perform at your best.

🗓️ Important Details to Note:

- You'll have 10 days in total — 7 days to prepare with your Study Kit, and a 3-day window to complete your assessment.

- The assessment must be taken in one sitting — once started, it must be completed without breaks or retries.

- Passing this assessment is a crucial part of your Cloud Top G enrollment process.

We recommend setting aside a calm environment and your full attention, this short window is your opportunity to show what's possible when focus meets preparation.

If you need more information about the program or have any further questions, our Support Team is always available at ${supportEmail}.

And remember, this assessment isn't about perfection. It's about potential.

So take your time, use your Study Kit well, and get ready to show us what you're capable of.

Warm regards,

Cloud Top G

P.S. You've already proven you're serious about growth. Now it's time to back it up with action. The assessment is where your Cloud Top G story truly begins.

Access Your Portal: ${portalUrl}

---
© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.
    `.trim();

    // Send email
    await EmailService.sendEmail({
      to: email,
      subject: `Welcome ${firstName}, Your Cloud Top G Journey Is Officially Underway`,
      html,
      text,
    });

    console.log(`✅ Application fee confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending application fee confirmation email:', error);
    throw new Error('Failed to send application fee confirmation email');
  }
};
