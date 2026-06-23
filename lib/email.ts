import nodemailer from 'nodemailer';

const FROM = process.env.EMAIL_FROM ?? `VC Sarees <${process.env.GMAIL_USER ?? 'no-reply@example.com'}>`;

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping email send');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: 'Reset your VC password',
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="margin:0;padding:0;background:#f8f5ef;font-family:Georgia,serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:40px 20px;">
              <tr><td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e8e0d5;border-radius:8px;padding:48px 44px;text-align:center;">
                  <tr><td>
                    <div style="font-size:38px;font-weight:400;letter-spacing:0.32em;color:#1a1a1a;line-height:1;margin-bottom:32px;">VC</div>
                    <h1 style="font-size:24px;font-weight:400;letter-spacing:0.02em;color:#1a1a1a;margin:0 0 12px;">Reset your password</h1>
                    <p style="font-size:14px;color:#6b6b6b;line-height:1.6;margin:0 0 32px;">We received a request to reset the password for your VC account. Click the button below to choose a new password.</p>
                    <a href="${resetUrl}" style="display:inline-block;background:#c9a84c;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:13px;font-weight:500;letter-spacing:0.08em;">Reset Password</a>
                    <p style="font-size:12px;color:#9b9b9b;line-height:1.6;margin:32px 0 0;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `,
    });
  } catch (err) {
    console.error('[email] Failed to send password reset email:', err);
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: 'Welcome to VC',
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="margin:0;padding:0;background:#f8f5ef;font-family:Georgia,serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:40px 20px;">
              <tr><td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e8e0d5;border-radius:8px;padding:48px 44px;text-align:center;">
                  <tr><td>
                    <div style="font-size:38px;font-weight:400;letter-spacing:0.32em;color:#1a1a1a;line-height:1;margin-bottom:32px;">VC</div>
                    <h1 style="font-size:24px;font-weight:400;letter-spacing:0.02em;color:#1a1a1a;margin:0 0 12px;">Welcome, ${name}</h1>
                    <p style="font-size:14px;color:#6b6b6b;line-height:1.6;margin:0 0 32px;">Your VC account has been created. Explore our curated saree collections and enjoy a luxurious shopping experience.</p>
                    <a href="${process.env.NEXTAUTH_URL ?? 'https://vcsarees.com'}/collections" style="display:inline-block;background:#c9a84c;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:13px;font-weight:500;letter-spacing:0.08em;">Explore Collections</a>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `,
    });
  } catch (err) {
    console.error('[email] Failed to send welcome email:', err);
  }
}
