import { EmailService } from '../services/EmailService';
import { baseEmailTemplate } from '../templates/baseTemplate';
import { config } from '../../../config';

export interface SendWelcomeEmailParams {
  email: string;
  firstName: string;
}

/**
 * Send welcome email to user after email verification
 */
export const sendWelcomeEmail = async (
  params: SendWelcomeEmailParams
): Promise<boolean> => {
  try {
    const { email, firstName } = params;

    // Application URL - you can customize this path
    const applicationUrl = `https://portal.cloudtopg.com/student`;
    const supportEmail = 'support@cloudtopg.com';

    // Generate email content
    const content = `
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        <strong>Hey ${firstName},</strong>
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        I'm <strong>Nwokolo Emmanuel</strong>, Founder & CEO of Cloud Top G, and I want to personally welcome you to our world.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        Thank you for signing up to learn with us. You've just taken the first real step toward building a world-class career in the cloud.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        When I started Cloud Top G, it was born from one belief; that talent alone isn't enough; structure, mentorship, and accountability are what turn learners into legacy builders. Our mission is to equip people with the skills, clarity, and systems to truly thrive in the global tech space.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        That's why we built Cloud Top G | <em>a system designed to turn raw potential into top-1% Cloud Engineers through accountability, mentorship, and hands-on experience.</em>
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        We don't do everything — we do <strong>one thing exceptionally well: Cloud Engineering.</strong>
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        That focus allows us to go deeper, train sharper, and produce graduates who stand out anywhere in the world.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        Our flagship <strong>12-Month School of Cloud Engineering Diploma</strong> is more than a Program; it's a transformation.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        Inside, you'll transform how you think, learn, and build. You'll develop the discipline, mindset, and guidance of someone destined to lead. Every step is designed to help you break limits, build proof, and create a legacy career you and your family will be proud of.
      </p>
      
      <p style="font-size: 18px; line-height: 1.8; color: #dc2626; font-weight: 600; margin: 30px 0 20px 0;">
        And here's where it gets exciting…
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        As part of our <strong>Cloud Top G Legacy Accelerator (valued at over ₦4,000,000)</strong>, you'll unlock <strong>₦6,000,000+ worth of exclusive bonuses — completely free.</strong> Each one is built to fast-track your growth and make your success not a matter of <em>if</em>, but <em>when:</em>
      </p>
      
      <div style="background-color: #f9fafb; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 4px;" class="bonus-list-container">
        <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 16px; line-height: 2;" class="bonus-list">
          <li style="margin-bottom: 15px;">
            <strong>💼 Career & ROI Transformation Suite™</strong> (Bonus) — learn how to earn back your investment and land your first remote role. (₦850,000 Value)
          </li>
          <li style="margin-bottom: 15px;">
            <strong>👥 A-Player Accountability System™</strong> — build unstoppable consistency with a personal concierge and weekly progress tracking. (₦600,000 Value)
          </li>
          <li style="margin-bottom: 15px;">
            <strong>🌍 Lifetime Mastermind Access™</strong> (Bonus) — network with ambitious engineers across the world. (₦700,000 Value)
          </li>
          <li style="margin-bottom: 0;">
            <strong>⚡ The Unstuck Mentor Line™</strong> — get expert help in 60 minutes or less whenever you're blocked, confused, or need direction. (<strong>₦599,000 Value</strong>)
          </li>
        </ul>
      </div>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        And trust me… this is just the tip of the iceberg.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        There's still so much more waiting inside once you step in, from personal brand mastery to guided mentorship paths that help you <em>not just learn, but win.</em>
      </p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 4px; font-style: italic;">
        <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.8;">
          "Cloud Top G gave me the clarity and confidence to work on real-world cloud projects, and it helped me land my first high-impact role." — <strong>Boluwatife A.</strong>
        </p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 30px 0 20px 0;">
        If you're ready to move from just learning to truly mastering, your next step starts here:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${applicationUrl}" class="mobile-button" target="_blank" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-sizing: border-box; max-width: 100%;">Start Your Application →</a>
      </div>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        And remember, you're never alone on this journey.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        If you ever need help or guidance, reach out anytime at <a href="mailto:${supportEmail}" style="color: #dc2626; text-decoration: none;"><strong>${supportEmail}</strong></a> — our team is always here for you.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 30px 0 10px 0;">
        Warm regards,
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">
        <strong>Nwokolo Emmanuel</strong>
      </p>
      
      <p style="font-size: 14px; line-height: 1.8; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <strong>P.S.</strong> The sooner you apply, the faster we can begin mapping your personalized cloud career plan. Let's build your legacy together.
      </p>
    `;

    const html = baseEmailTemplate({
      title: `Welcome to ${config.app.name}, ${firstName} — Your Journey to the Top 1% Starts Here`,
      // preheader: `Welcome ${firstName}! Your journey to becoming a top-1% Cloud Engineer starts here.`,
      content,
      footerText: `© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.`,
    });

    // Generate plain text version
    const text = `
Hey ${firstName},

I'm Nwokolo Emmanuel, Founder & CEO of Cloud Top G, and I want to personally welcome you to our world.

Thank you for signing up to learn with us. You've just taken the first real step toward building a world-class career in the cloud.

When I started Cloud Top G, it was born from one belief; that talent alone isn't enough; structure, mentorship, and accountability are what turn learners into legacy builders. Our mission is to equip people with the skills, clarity, and systems to truly thrive in the global tech space.

That's why we built Cloud Top G | a system designed to turn raw potential into top-1% Cloud Engineers through accountability, mentorship, and hands-on experience.

We don't do everything — we do one thing exceptionally well: Cloud Engineering.

That focus allows us to go deeper, train sharper, and produce graduates who stand out anywhere in the world.

Our flagship 12-Month School of Cloud Engineering Diploma is more than a Program; it's a transformation.

Inside, you'll transform how you think, learn, and build. You'll develop the discipline, mindset, and guidance of someone destined to lead. Every step is designed to help you break limits, build proof, and create a legacy career you and your family will be proud of.

And here's where it gets exciting…

As part of our Cloud Top G Legacy Accelerator (valued at over ₦4,000,000), you'll unlock ₦6,000,000+ worth of exclusive bonuses — completely free. Each one is built to fast-track your growth and make your success not a matter of if, but when:

- 💼 Career & ROI Transformation Suite™ (Bonus) — learn how to earn back your investment and land your first remote role. (₦850,000 Value)

- 👥 A-Player Accountability System™ — build unstoppable consistency with a personal concierge and weekly progress tracking. (₦600,000 Value)

- 🌍 Lifetime Mastermind Access™ (Bonus) — network with ambitious engineers across the world. (₦700,000 Value)

- ⚡ The Unstuck Mentor Line™ — get expert help in 60 minutes or less whenever you're blocked, confused, or need direction. (₦599,000 Value)

And trust me… this is just the tip of the iceberg.

There's still so much more waiting inside once you step in, from personal brand mastery to guided mentorship paths that help you not just learn, but win.

"Cloud Top G gave me the clarity and confidence to work on real-world cloud projects, and it helped me land my first high-impact role." — Boluwatife A.

If you're ready to move from just learning to truly mastering, your next step starts here:

Start Your Application: ${applicationUrl}

And remember, you're never alone on this journey.

If you ever need help or guidance, reach out anytime at ${supportEmail} — our team is always here for you.

Warm regards,

Nwokolo Emmanuel

P.S. The sooner you apply, the faster we can begin mapping your personalized cloud career plan. Let's build your legacy together.

---
© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.
    `.trim();

    // Send email
    await EmailService.sendEmail({
      to: email,
      subject: `Welcome to ${config.app.name}, ${firstName} — Your Journey to the Top 1% Starts Here`,
      html,
      text,
    });

    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};
