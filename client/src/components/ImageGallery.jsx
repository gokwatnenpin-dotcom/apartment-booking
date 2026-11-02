import { useState } from 'react';

const FALLBACK = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';

export default function ImageGallery({ images, title }) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const imgs = images?.length ? images : [FALLBACK];

  const prev = (e) => {
    e?.stopPropagation();
    setSelected((s) => (s - 1 + imgs.length) % imgs.length);
  };
  const next = (e) => {
    e?.stopPropagation();
    setSelected((s) => (s + 1) % imgs.length);
  };

  return (
    <>
      {/* Main image */}
      <div
        className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in group"
        onClick={() => setLightbox(true)}
      >
        <img
          src={imgs[selected]}
          alt={`${title} – photo ${selected + 1}`}
          className="w-full h-full object-cover transition-opacity"
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
        />
        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
          {selected + 1} / {imgs.length}
        </div>
        {/* Arrows on hover */}
        {imgs.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === selected ? 'border-blue-500 scale-95' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={img} alt={`${title} thumb ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = FALLBACK; }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-5 text-white text-4xl hover:text-gray-300 leading-none" onClick={() => setLightbox(false)}>
            ×
          </button>
          <img
            src={imgs[selected]}
            alt={title}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
          {imgs.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gray-300 bg-black/30 hover:bg-black/50 w-12 h-12 rounded-full flex items-center justify-center"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gray-300 bg-black/30 hover:bg-black/50 w-12 h-12 rounded-full flex items-center justify-center"
              >
                ›
              </button>
            </>
          )}
          <div className="absolute bottom-4 text-white/60 text-sm">
            {selected + 1} / {imgs.length} — click anywhere to close
          </div>
        </div>
      )}
    </>
  );
}
