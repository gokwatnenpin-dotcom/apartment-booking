const BREVO_API = 'https://api.brevo.com/v3';

async function sendBookingEmail(booking, paymentUrl) {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    console.warn('Brevo email skipped: BREVO_API_KEY or BREVO_SENDER_EMAIL is not configured.');
    return;
  }
  const recipient = booking.user?.email || booking.guestEmail;
  if (!recipient) return;
  const name = booking.user?.name || booking.guestName || 'Guest';
  const dates = `${new Date(booking.checkIn).toLocaleDateString('en-NG')} – ${new Date(booking.checkOut).toLocaleDateString('en-NG')}`;
  const amount = new Intl.NumberFormat('en-NG').format(Number(booking.totalPrice));
  const html = emailLayout('Your stay is reserved', `<p style="margin:0 0 18px">Hello ${escapeHtml(name)},</p><p style="margin:0 0 18px">Your reservation is ready. Review your stay details below and continue to payment whenever you’re ready.</p>${bookingDetails(booking, dates, amount)}<p style="margin:20px 0;color:#66727A;font-size:14px">Your reservation is held for 24 hours. Complete payment before it expires.</p><p style="margin:28px 0;text-align:center"><a href="${escapeHtml(paymentUrl)}" style="display:inline-block;background:#B94A30;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:8px">Continue to pay</a></p><p style="margin:0;color:#66727A;font-size:13px;text-align:center">Secure checkout powered by Paystack</p>`);
  const response = await fetch(`${BREVO_API}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME || 'Zestay' }, to: [{ email: recipient, name }], subject: `Booking details: ${booking.apartment.title}`, htmlContent: html }),
  });
  if (!response.ok) throw new Error(`Brevo email failed (${response.status}): ${await response.text()}`);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

module.exports = { sendBookingEmail };

async function sendReceiptEmail(booking) {
  const recipient = booking.user?.email || booking.guestEmail;
  if (!recipient || !process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) return;
  const name = booking.user?.name || booking.guestName || 'Guest';
  const nights = Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000));
  const amount = new Intl.NumberFormat('en-NG').format(Number(booking.totalPrice));
  const date = (value) => new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  const details = bookingDetails(booking, `${date(booking.checkIn)} – ${date(booking.checkOut)}`, amount);
  await sendTransactional(recipient, name, `Payment receipt: ${booking.apartment.title}`, emailLayout('Payment received', `<p style="margin:0 0 18px">Hello ${escapeHtml(name)}, your payment was successful and your stay is confirmed.</p>${details}<table role="presentation" style="width:100%;margin-top:16px;border-collapse:collapse"><tr><td style="padding:8px 0;color:#66727A">Nights</td><td style="padding:8px 0;text-align:right;font-weight:700">${nights}</td></tr><tr><td style="padding:8px 0;color:#66727A">Booking reference</td><td style="padding:8px 0;text-align:right;font-weight:700">${escapeHtml(booking.paymentReference || booking.id)}</td></tr><tr><td style="padding:8px 0;color:#66727A">Payment date</td><td style="padding:8px 0;text-align:right;font-weight:700">${date(booking.paidAt || new Date())}</td></tr></table><p style="margin:22px 0 0;color:#66727A;font-size:14px">Keep this email as your payment receipt.</p>`));
}

async function sendCancellationEmail(booking, reason) {
  const recipient = booking.user?.email || booking.guestEmail;
  if (!recipient || !process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) return;
  const name = booking.user?.name || booking.guestName || 'Guest';
  const dates = `${new Date(booking.checkIn).toLocaleDateString('en-NG')} – ${new Date(booking.checkOut).toLocaleDateString('en-NG')}`;
  const amount = new Intl.NumberFormat('en-NG').format(Number(booking.totalPrice));
  await sendTransactional(recipient, name, `Booking cancelled: ${booking.apartment.title}`, emailLayout('Booking cancelled', `<p style="margin:0 0 18px">Hello ${escapeHtml(name)}, your reservation has been cancelled.</p>${bookingDetails(booking, dates, amount)}<div style="margin-top:18px;padding:16px;background:#F5F2EB;border-left:4px solid #B94A30;border-radius:4px"><p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#66727A;text-transform:uppercase">Reason for cancellation</p><p style="margin:0">${escapeHtml(reason)}</p></div><p style="margin:20px 0 0;color:#66727A;font-size:14px">If you paid and want to request a refund, email <a href="mailto:zestayapartments@gmail.com" style="color:#B94A30;font-weight:700">zestayapartments@gmail.com</a>. Cancellation does not automatically issue a refund.</p>`));
}

function bookingDetails(booking, dates, amount) {
  return `<table role="presentation" style="width:100%;border:1px solid #E3DED3;border-radius:8px;border-spacing:0;background:#ffffff"><tr><td colspan="2" style="padding:16px 18px;border-bottom:1px solid #E3DED3"><div style="font-size:12px;color:#66727A">YOUR APARTMENT</div><div style="margin-top:4px;font-size:18px;font-weight:700;color:#1F2A30">${escapeHtml(booking.apartment.title)}</div><div style="margin-top:3px;font-size:13px;color:#66727A">${escapeHtml(booking.apartment.location)}</div></td></tr><tr><td style="padding:11px 18px;color:#66727A">Stay dates</td><td style="padding:11px 18px;text-align:right;font-weight:600">${dates}</td></tr><tr><td style="padding:11px 18px;color:#66727A">Guests</td><td style="padding:11px 18px;text-align:right;font-weight:600">${booking.guests}</td></tr><tr><td style="padding:13px 18px;border-top:1px solid #E3DED3;color:#1F2A30;font-weight:700">${booking.paidAt ? 'Total paid' : 'Total'}</td><td style="padding:13px 18px;border-top:1px solid #E3DED3;text-align:right;color:#1F2A30;font-size:18px;font-weight:700">₦${amount}</td></tr></table>`;
}

function emailLayout(title, content) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F5F2EB;font-family:Arial,Helvetica,sans-serif;color:#1F2A30"><table role="presentation" style="width:100%;border-spacing:0;background:#F5F2EB"><tr><td align="center" style="padding:28px 12px"><table role="presentation" style="width:100%;max-width:600px;border-spacing:0"><tr><td style="padding:18px 24px;background:#1F2A30;border-radius:12px 12px 0 0"><span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.3px">Zestay</span><span style="float:right;color:#E3DED3;font-size:12px;padding-top:5px">STAYS MADE SIMPLE</span></td></tr><tr><td style="padding:30px 24px;background:#ffffff"><div style="margin:0 0 20px;color:#B94A30;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase">${escapeHtml(title)}</div>${content}</td></tr><tr><td style="padding:18px 24px;background:#E3DED3;border-radius:0 0 12px 12px;color:#66727A;font-size:12px;line-height:1.6">Zestay · Your booking information, all in one place.<br>Booking emails are essential service messages. <a href="${escapeHtml(process.env.CLIENT_URL || '')}/unsubscribe" style="color:#1F2A30">Email preferences</a></td></tr></table></td></tr></table></body></html>`;
}

async function sendTransactional(email, name, subject, htmlContent) {
  const response = await fetch(`${BREVO_API}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME || 'Zestay' }, to: [{ email, name }], subject, htmlContent }),
  });
  if (!response.ok) throw new Error(`Brevo email failed (${response.status}): ${await response.text()}`);
}

module.exports = { sendBookingEmail, sendReceiptEmail, sendCancellationEmail };
