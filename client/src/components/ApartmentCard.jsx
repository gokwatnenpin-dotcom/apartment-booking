import { Link } from 'react-router-dom';

const FALLBACK = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=85';

export default function ApartmentCard({ apartment }) {
  const { id, title, location, pricePerNight, bedrooms, bathrooms, maxGuests, images } = apartment;
  return (
    <article className="group overflow-hidden rounded-card border border-sand-deep bg-white">
      <Link to={`/apartments/${id}`} aria-label={`View ${title}`} className="block overflow-hidden bg-sand">
        <img src={images?.[0] || FALLBACK} alt={title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" onError={(event) => { event.currentTarget.src = FALLBACK; }} />
      </Link>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-slate">{location}</p>
            <h3 className="mt-1 truncate font-heading text-lg font-bold">{title}</h3>
          </div>
          <p className="shrink-0 text-right font-heading font-bold">${Number(pricePerNight).toFixed(0)}<span className="block font-body text-xs font-normal text-slate">/ night</span></p>
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-sand-deep pt-3 text-xs text-slate">
          <span>{bedrooms} {bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span><span aria-hidden="true">·</span>
          <span>{bathrooms} {bathrooms === 1 ? 'bath' : 'baths'}</span><span aria-hidden="true">·</span>
          <span>Up to {maxGuests} guests</span>
        </div>
        <Link to={`/apartments/${id}`} className="mt-4 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline">View stay <span className="ml-1" aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
