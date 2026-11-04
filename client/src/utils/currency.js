const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export function formatNaira(value) {
  const amount = Number(value);
  return nairaFormatter.format(Number.isFinite(amount) ? amount : 0);
}
