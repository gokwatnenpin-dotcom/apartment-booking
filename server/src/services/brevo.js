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
  const html = `<h1>Complete your apartment booking</h1><p>Hello ${escapeHtml(name)},</p><p>Your apartment: <strong>${escapeHtml(booking.apartment.title)}</strong> in ${escapeHtml(booking.apartment.location)}.</p><p>Dates: ${dates}<br>Guests: ${booking.guests}<br>Total: ₦${amount}</p><p><a href="${escapeHtml(paymentUrl)}">Continue to secure Paystack payment</a></p><hr><p>Booking updates are transactional. <a href="${escapeHtml(process.env.CLIENT_URL || '')}/unsubscribe">Unsubscribe from marketing emails</a>.</p>`;
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
