import { Link } from 'react-router-dom';

const FALLBACK = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';

export default function ApartmentCard({ apartment }) {
  const { id, title, location, pricePerNight, bedrooms, bathrooms, maxGuests, images, isAvailable } =
    apartment;

  return (
    <Link
      to={`/apartments/${id}`}
      className="card hover:shadow-md transition-all duration-200 group block"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <img
          src={images?.[0] || FALLBACK}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
          loading="lazy"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 flex-1">
            {title}
          </h3>
          <span className="shrink-0 text-blue-600 font-bold">
            ${parseFloat(pricePerNight).toFixed(0)}
            <span className="text-xs text-gray-400 font-normal">/night</span>
          </span>
        </div>

        <p className="text-gray-500 text-sm flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{location}</span>
        </p>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span>🛏 {bedrooms} bed{bedrooms !== 1 ? 's' : ''}</span>
          <span>🚿 {bathrooms} bath{bathrooms !== 1 ? 's' : ''}</span>
          <span>👥 {maxGuests} guests</span>
        </div>
      </div>
    </Link>
  );
}
