import nodemailer from 'nodemailer';
import type { Document } from 'mongoose';
import type { IOrder } from './models/Order';

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

function formatINR(amount: number) {
  return '₹ ' + amount.toLocaleString('en-IN');
}

function wrapEmail(body: string) {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background:#f8f5ef;font-family:Georgia,serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:40px 20px;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e8e0d5;border-radius:8px;padding:48px 44px;">
          <tr><td>
            <div style="font-size:34px;font-weight:400;letter-spacing:0.32em;color:#1a1a1a;line-height:1;margin-bottom:32px;">VC</div>
            ${body}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

async function sendStatusEmail(order: IOrder, subject: string, bodyHtml: string) {
  const transporter = getTransporter();
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from:    FROM,
      to:      order.shippingAddress.email,
      subject,
      html:    wrapEmail(bodyHtml),
    });
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${order.shippingAddress.email}:`, err);
  }
}

export async function sendOrderConfirmation(order: IOrder & Document) {
  const transporter = getTransporter();
  if (!transporter) return;

  const itemsHtml = order.items
    .map(i => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e8e0d5;">${i.name}</td><td style="padding:8px 12px;border-bottom:1px solid #e8e0d5;text-align:center;">${i.qty}</td><td style="padding:8px 12px;border-bottom:1px solid #e8e0d5;text-align:right;">${formatINR(i.price)}</td></tr>`)
    .join('');

  const customerHtml = wrapEmail(`
    <h1 style="font-size:22px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Your order is confirmed</h1>
    <p style="font-size:14px;color:#6b6b6b;margin:0 0 28px;">Order <strong style="color:#1a1a1a;">${order.orderNumber}</strong> · Payment: Cash on Delivery</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e0d5;border-radius:4px;border-collapse:collapse;margin-bottom:24px;">
      <tr style="background:#f8f5ef;">
        <th style="padding:10px 12px;text-align:left;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b6b6b;font-weight:500;">Item</th>
        <th style="padding:10px 12px;text-align:center;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b6b6b;font-weight:500;">Qty</th>
        <th style="padding:10px 12px;text-align:right;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b6b6b;font-weight:500;">Price</th>
      </tr>
      ${itemsHtml}
      <tr>
        <td colspan="2" style="padding:10px 12px;font-weight:600;color:#1a1a1a;">Total</td>
        <td style="padding:10px 12px;font-weight:600;color:#c9a84c;text-align:right;">${formatINR(order.total)}</td>
      </tr>
    </table>
    <p style="font-size:13px;color:#6b6b6b;margin:0 0 6px;"><strong style="color:#1a1a1a;">Delivering to:</strong></p>
    <p style="font-size:13px;color:#6b6b6b;margin:0;">${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} — ${order.shippingAddress.pincode}</p>
    <p style="font-size:12px;color:#9b9b9b;margin:24px 0 0;">Please keep cash of <strong>${formatINR(order.total)}</strong> ready for our delivery partner.</p>
  `);

  const adminHtml = `
    <p>New COD order received: <strong>${order.orderNumber}</strong> — ${formatINR(order.total)}</p>
    <p><a href="${process.env.NEXTAUTH_URL}/admin/orders/${order._id}">View order in admin panel</a></p>
    <p>Customer: ${order.shippingAddress.name ?? ''} · ${order.shippingAddress.email}</p>
  `;

  const results = await Promise.allSettled([
    transporter.sendMail({
      from:    FROM,
      to:      order.shippingAddress.email,
      subject: `Order confirmed · ${order.orderNumber}`,
      html:    customerHtml,
    }),
    transporter.sendMail({
      from:    FROM,
      to:      process.env.ADMIN_ALERT_EMAIL ?? process.env.GMAIL_USER ?? '',
      subject: `New order ${order.orderNumber} · ${formatINR(order.total)}`,
      html:    adminHtml,
    }),
  ]);

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[email] sendOrderConfirmation failed (recipient ${i === 0 ? 'customer' : 'admin'}):`, r.reason);
    }
  });
}

export async function sendShippedNotification(order: IOrder) {
  await sendStatusEmail(
    order,
    `Your order ${order.orderNumber} has been shipped`,
    `<h1 style="font-size:22px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Your order is on its way!</h1>
    <p style="font-size:14px;color:#6b6b6b;margin:0 0 16px;">Order <strong style="color:#1a1a1a;">${order.orderNumber}</strong> has been dispatched.</p>
    <p style="font-size:13px;color:#9b9b9b;margin:0;">Please keep <strong style="color:#1a1a1a;">${formatINR(order.total)}</strong> cash ready for our delivery partner.</p>`,
  );
}

export async function sendStatusConfirmed(order: IOrder) {
  await sendStatusEmail(
    order,
    `Your order ${order.orderNumber} has been confirmed`,
    `<h1 style="font-size:22px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Order confirmed</h1>
    <p style="font-size:14px;color:#6b6b6b;margin:0 0 16px;">Order <strong style="color:#1a1a1a;">${order.orderNumber}</strong> has been confirmed and is being prepared.</p>
    <p style="font-size:13px;color:#9b9b9b;margin:0;">We will notify you once it is shipped. Total payable: <strong style="color:#1a1a1a;">${formatINR(order.total)}</strong> (Cash on Delivery).</p>`,
  );
}

export async function sendStatusDelivered(order: IOrder) {
  await sendStatusEmail(
    order,
    `Your order ${order.orderNumber} has been delivered`,
    `<h1 style="font-size:22px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Order delivered</h1>
    <p style="font-size:14px;color:#6b6b6b;margin:0 0 16px;">Order <strong style="color:#1a1a1a;">${order.orderNumber}</strong> has been successfully delivered. Thank you for shopping with us!</p>
    <p style="font-size:13px;color:#9b9b9b;margin:0;">We hope you love your purchase.</p>`,
  );
}

export async function sendStatusCancelled(order: IOrder) {
  await sendStatusEmail(
    order,
    `Your order ${order.orderNumber} has been cancelled`,
    `<h1 style="font-size:22px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Order cancelled</h1>
    <p style="font-size:14px;color:#6b6b6b;margin:0 0 16px;">Order <strong style="color:#1a1a1a;">${order.orderNumber}</strong> has been cancelled.</p>
    <p style="font-size:13px;color:#9b9b9b;margin:0;">If you have any questions, please contact us. We are happy to help.</p>`,
  );
}

export async function sendStatusPending(order: IOrder) {
  await sendStatusEmail(
    order,
    `Your order ${order.orderNumber} status update`,
    `<h1 style="font-size:22px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Order status updated</h1>
    <p style="font-size:14px;color:#6b6b6b;margin:0 0 16px;">Order <strong style="color:#1a1a1a;">${order.orderNumber}</strong> has been updated to <strong style="color:#1a1a1a;">Pending</strong>.</p>
    <p style="font-size:13px;color:#9b9b9b;margin:0;">Our team will be in touch soon.</p>`,
  );
}

export async function sendWhatsApp(phone: string, message: string) {
  if (!process.env.WATI_API_URL || !process.env.WATI_API_TOKEN) return;
  const cleanPhone = phone.replace(/\D/g, '');
  try {
    await fetch(`${process.env.WATI_API_URL}/api/v1/sendSessionMessage/${cleanPhone}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${process.env.WATI_API_TOKEN}`,
      },
      body: JSON.stringify({ messageText: message }),
    });
  } catch {
    console.error('[WATI] Failed to send WhatsApp message');
  }
}
