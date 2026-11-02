export default function LoadingSpinner({ fullPage = false, size = 'md' }) {
  const sizes = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-4', lg: 'h-12 w-12 border-4' };
  const spinner = <div role="status" aria-label="Loading" className={`${sizes[size]} animate-spin rounded-full border-sand-deep border-t-accent`} />;
  if (fullPage) return <div className="fixed inset-0 z-40 flex items-center justify-center bg-sand/90">{spinner}</div>;
  return <div className="flex items-center justify-center py-5">{spinner}</div>;
}
