import { useState } from 'react';

const FALLBACK = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=85';

export default function ImageGallery({ images = [], title }) {
  const validImages = Array.isArray(images) ? images.filter((image) => typeof image === 'string' && image.trim()) : [];
  const photos = validImages.length ? validImages.slice(0, 3) : [FALLBACK];
  const [active, setActive] = useState(null);
  const open = (index) => setActive(index);
  const move = (direction) => setActive((index) => (index + direction + photos.length) % photos.length);
  const handleImageError = (event) => {
    if (event.currentTarget.src !== FALLBACK) event.currentTarget.src = FALLBACK;
    else event.currentTarget.hidden = true;
  };
  return (
    <>
      <div className="grid h-[280px] grid-cols-1 gap-2 overflow-hidden rounded-card sm:h-[380px] sm:grid-cols-[1.55fr_1fr] lg:h-[440px]">
        <button type="button" onClick={() => open(0)} className="group h-full overflow-hidden bg-sand text-left" aria-label="Open photo 1">
          <img src={photos[0]} alt={`${title}, photo 1`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" onError={handleImageError} />
        </button>
        <div className="hidden min-h-0 grid-rows-2 gap-2 sm:grid">
          {[1, 2].map((index) => <button key={index} type="button" onClick={() => open(Math.min(index, photos.length - 1))} className="group min-h-0 overflow-hidden bg-sand text-left" aria-label={`Open photo ${Math.min(index, photos.length - 1) + 1}`}>
            {photos[index] ? <img src={photos[index]} alt={`${title}, photo ${index + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" onError={handleImageError} /> : <span className="flex h-full items-center justify-center bg-sand text-sm text-slate">More photos coming soon</span>}
          </button>)}
        </div>
      </div>
      {active !== null && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4" role="dialog" aria-modal="true" aria-label={`${title} photo gallery`} onClick={() => setActive(null)} onKeyDown={(event) => { if (event.key === 'Escape') setActive(null); if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1); }} tabIndex={-1}>
        <button type="button" className="absolute right-4 top-4 h-11 w-11 rounded-full border border-white/40 text-2xl text-white" onClick={() => setActive(null)} aria-label="Close gallery">×</button>
        <button type="button" className="absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border border-white/40 text-2xl text-white sm:left-8" onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="Previous photo">‹</button>
        <img src={photos[active]} alt={`${title}, photo ${active + 1} of ${photos.length}`} className="max-h-[85vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} onError={handleImageError} />
        <button type="button" className="absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border border-white/40 text-2xl text-white sm:right-8" onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="Next photo">›</button>
        <p className="absolute bottom-4 text-sm text-white">{active + 1} of {photos.length}</p>
      </div>}
    </>
  );
}
