import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function PaymentContinue() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Preparing secure Paystack checkout…');
  useEffect(() => {
    const token = params.get('token');
    if (!token) { setMessage('This payment link is invalid.'); return; }
    api.post(`/bookings/payment/continue/${token}`).then(({ data }) => window.location.assign(data.paymentUrl)).catch((error) => setMessage(error.response?.data?.message || 'Could not start payment.'));
  }, [params]);
  return <main className="page-shell py-16 text-center"><h1 className="font-heading text-2xl font-bold">Continue to payment</h1><p className="mt-3">{message}</p></main>;
}
