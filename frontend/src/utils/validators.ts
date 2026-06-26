// Validators and formatters used across the app

export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const re = /^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/;
  return re.test(email.trim());
};

export const validatePassword = (password: string): boolean => {
  if (!password) return false;
  // Minimum 8 characters, at least one uppercase, one lowercase and one number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
};

const extractMaliPhoneDigits = (phone: string): string => {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('223') && digits.length > 8) {
    digits = digits.slice(3);
  }
  return digits.slice(0, 8);
};

export const validatePhoneMali = (phone: string): boolean => {
  if (!phone) return false;
  return extractMaliPhoneDigits(phone).length === 8;
};

export const maskPhoneNumber = (phone: string): string => {
  const digits = extractMaliPhoneDigits(phone);
  if (!digits) return '';

  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 6));
  if (digits.length > 6) parts.push(digits.slice(6, 8));

  return parts.join(' ');
};

export const normalizePhoneMali = (phone: string): string => extractMaliPhoneDigits(phone);

export const maskSuperficie = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '';
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  if (Number.isNaN(n)) return '';
  return `${n % 1 === 0 ? n : n.toFixed(2)} ha`;
};

export default {
  validateEmail,
  validatePassword,
  validatePhoneMali,
  maskPhoneNumber,
  normalizePhoneMali,
  maskSuperficie,
};
