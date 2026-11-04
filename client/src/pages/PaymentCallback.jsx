import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const [state, setState] = useState('Checking your payment…');
  useEffect(() => { api.get(`/bookings/payment/verify?reference=${encodeURIComponent(params.get('reference') || '')}`).then(() => setState('Payment received. Your booking is confirmed.')).catch(() => setState('We could not confirm the payment yet. You can retry from your booking email.')); }, [params]);
  return <main className="page-shell py-16 text-center"><h1 className="font-heading text-2xl font-bold">Payment status</h1><p className="mt-3">{state}</p><Link className="btn-primary mt-6" to="/profile">Go to my bookings</Link></main>;
}
