import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ApartmentCard from '../components/ApartmentCard';
import api from '../api/axios';

const steps = [
  { number: '01', title: 'Choose your place', copy: 'Search stays by location, dates and the details that matter to you.' },
  { number: '02', title: 'Make it yours', copy: 'Check the photos, amenities and full price before you reserve.' },
  { number: '03', title: 'Settle in', copy: 'Your confirmed stay and booking details are ready in one place.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get('/apartments?limit=3')
      .then(({ data }) => setFeatured(data.data || []))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-sand pb-14 pt-14 sm:pb-20 sm:pt-20">
        <div className="page-shell">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">A better way to stay</p>
            <h1 className="max-w-2xl text-[40px] font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-[56px] lg:leading-[1.08]">Book the place.<br className="hidden sm:block" /> Skip the noise.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate sm:text-lg">Find an apartment that fits your plans, with clear details and a straightforward booking.</p>
          </div>
          <div className="mt-9 max-w-5xl"><SearchBar /></div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="page-shell">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Handpicked for you</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-[30px]">Featured stays</h2>
            </div>
            <Link to="/apartments" className="text-sm font-semibold text-accent underline-offset-4 hover:underline">Browse all stays <span aria-hidden="true">→</span></Link>
          </div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading featured stays">
              {[0, 1, 2].map((item) => <div key={item} className="h-[340px] animate-pulse rounded-card border border-sand-deep bg-sand" />)}
            </div>
          ) : featured.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured.slice(0, 3).map((apartment) => <ApartmentCard key={apartment.id} apartment={apartment} />)}</div>
          ) : (
            <div className="rounded-card border border-sand-deep bg-sand px-6 py-12 text-center">
              <h3 className="font-heading text-lg font-bold">{failed ? 'Stays are temporarily unavailable' : 'No stays to show yet'}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate">{failed ? 'Please try again in a moment, or browse all stays.' : 'New apartments will appear here as soon as they are listed.'}</p>
              <Link to="/apartments" className="mt-5 inline-flex font-semibold text-accent underline-offset-4 hover:underline">Browse stays</Link>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-sand-deep bg-sand py-14 sm:py-16">
        <div className="page-shell">
          <div className="max-w-xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-[30px]">A clear path to your stay</h2>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step) => <li key={step.number} className="rounded-card border border-sand-deep bg-white p-6">
              <span className="font-heading text-sm font-bold text-accent">{step.number}</span>
              <h3 className="mt-5 font-heading text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate">{step.copy}</p>
            </li>)}
          </ol>
        </div>
      </section>
    </>
  );
}
