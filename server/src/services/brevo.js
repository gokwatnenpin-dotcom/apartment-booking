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
  const html = `<h1>Your stay is reserved</h1><p>Hello ${escapeHtml(name)},</p><p>Your apartment: <strong>${escapeHtml(booking.apartment.title)}</strong> in ${escapeHtml(booking.apartment.location)}.</p><p>Dates: ${dates}<br>Guests: ${booking.guests}<br>Total: ₦${amount}<br>Pay within 24 hours to keep this reservation.</p><p><a href="${escapeHtml(paymentUrl)}">Continue to pay with Paystack</a></p><hr><p>Booking updates are transactional. <a href="${escapeHtml(process.env.CLIENT_URL || '')}/unsubscribe">Unsubscribe from marketing emails</a>.</p>`;
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
  await sendTransactional(recipient, name, `Payment receipt: ${booking.apartment.title}`, `<h1>Payment received</h1><p>Hello ${escapeHtml(name)}, your booking is confirmed and paid.</p><p><b>Apartment:</b> ${escapeHtml(booking.apartment.title)}<br><b>Location:</b> ${escapeHtml(booking.apartment.location)}<br><b>Check-in:</b> ${date(booking.checkIn)}<br><b>Check-out:</b> ${date(booking.checkOut)}<br><b>Guests:</b> ${booking.guests}<br><b>Nights:</b> ${nights}<br><b>Total paid:</b> ₦${amount}<br><b>Booking reference:</b> ${escapeHtml(booking.paymentReference || booking.id)}<br><b>Payment date:</b> ${date(booking.paidAt || new Date())}</p><p>Keep this email as your receipt.</p>`);
}

async function sendCancellationEmail(booking, reason) {
  const recipient = booking.user?.email || booking.guestEmail;
  if (!recipient || !process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) return;
  const name = booking.user?.name || booking.guestName || 'Guest';
  await sendTransactional(recipient, name, `Booking cancelled: ${booking.apartment.title}`, `<h1>Booking cancelled</h1><p>Hello ${escapeHtml(name)}, your booking for <b>${escapeHtml(booking.apartment.title)}</b> has been cancelled.</p><p>Check-in: ${new Date(booking.checkIn).toLocaleDateString('en-NG')}<br>Check-out: ${new Date(booking.checkOut).toLocaleDateString('en-NG')}<br>Total: ₦${new Intl.NumberFormat('en-NG').format(Number(booking.totalPrice))}</p><p>Cancellation reason: ${escapeHtml(reason)}</p><p>If you paid, contact us to ask about refund eligibility. This email does not confirm a refund.</p>`);
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
