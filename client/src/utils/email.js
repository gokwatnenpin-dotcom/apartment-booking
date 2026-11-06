const strictEmailPattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)*\.[A-Z]{2,}$/i;

export function isValidEmail(value) {
  const email = String(value || '').trim();
  if (email.length > 254) return false;
  const [local] = email.split('@');
  return Boolean(local && local.length <= 64 && strictEmailPattern.test(email));
}
