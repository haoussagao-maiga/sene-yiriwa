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

export const validatePhoneMali = (phone: string): boolean => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  // Mali local numbers are 8 digits. With country code (+223) it's 11 digits starting with 223
  if (digits.length === 8) return true;
  if (digits.length === 11 && digits.startsWith('223')) return true;
  return false;
};

export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  let core = digits;
  if (digits.length === 11 && digits.startsWith('223')) {
    core = digits.slice(3);
  }

  // Format core 8 digits as 'XX XX XXXX'
  if (core.length === 8) {
    return `+223 ${core.slice(0,2)} ${core.slice(2,4)} ${core.slice(4)}`;
  }

  // Fallback: group by 3
  return digits.replace(/(\d{1,3})(?=(\d{3})+$)/g, '$1 ');
};

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
  maskSuperficie,
};
