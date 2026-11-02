import { Link } from 'react-router-dom';

export default function ZiggyLogo({ reversed = false, markOnly = false, className = '' }) {
  const tile = reversed ? '#F5F2EB' : '#1F2A30';
  const glyph = reversed ? '#1F2A30' : '#F5F2EB';
  const wordmark = reversed ? '#F5F2EB' : '#1F2A30';
  return (
    <Link to="/" aria-label="Ziggy home" className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 40 40" className="h-9 w-9 shrink-0">
        <rect width="40" height="40" rx="11" fill={tile} />
        <path d="M11 12h18L12 28h17" fill="none" stroke={glyph} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m20 20 9-8" fill="none" stroke="#B94A30" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      {!markOnly && <span className="font-heading text-[22px] font-extrabold tracking-[-0.06em]" style={{ color: wordmark }}>ziggy</span>}
    </Link>
  );
}
