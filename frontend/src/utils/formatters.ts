/**
 * Formatters - Sènè Yiriwa
 * 
 * Ce fichier contient toutes les fonctions de formatage pour l'application.
 * Il fournit des utilitaires pour formater les dates, les nombres,
 * les devises, les téléphones, et d'autres données courantes.
 * 
 * Fonctionnalités :
 * - Formatage des dates (relatif, absolu, heure)
 * - Formatage des nombres (décimal, pourcentage)
 * - Formatage des devises (FCFA)
 * - Formatage des téléphones (format Mali)
 * - Formatage des noms et texte
 * - Formatage des durées
 * - Formatage des superficies (hectares)
 * - Formatage des rendements (tonnes/ha)
 * 
 * @module utils/formatters
 */

// ============================================
// FORMATAGE DES DATES
// ============================================

/**
 * Interface pour les options de formatage de date
 */
interface DateFormatOptions {
  /** Format de date souhaité */
  format?: 'full' | 'long' | 'medium' | 'short' | 'relative';
  
  /** Langue pour le formatage (fr: français, bm: bambara) */
  locale?: 'fr' | 'bm';
  
  /** Inclure l'heure */
  includeTime?: boolean;
  
  /** Inclure les secondes */
  includeSeconds?: boolean;
}

/**
 * Options par défaut pour le formatage de date
 */
const DEFAULT_DATE_OPTIONS: DateFormatOptions = {
  format: 'medium',
  locale: 'fr',
  includeTime: false,
  includeSeconds: false,
};

/**
 * Formate une date en français ou bambara
 * 
 * @param date - Date à formater
 * @param options - Options de formatage
 * @returns Date formatée
 * 
 * @example
 * formatDate(new Date(), { format: 'full' }) // "lundi 15 mai 2025"
 * formatDate(new Date(), { format: 'relative' }) // "il y a 2 heures"
 */
export const formatDate = (
  date: Date | string | number,
  options: DateFormatOptions = DEFAULT_DATE_OPTIONS
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  const { format, locale, includeTime, includeSeconds } = { ...DEFAULT_DATE_OPTIONS, ...options };
  
  // Format relatif (ex: "il y a 2 heures")
  if (format === 'relative') {
    return formatRelativeDate(dateObj, locale || 'fr');
  }
  
  // Formatage standard avec Intl
  const localeCode = locale === 'bm' ? 'fr-FR' : 'fr-FR';
  
  let dateStyle: Intl.DateTimeFormatOptions['dateStyle'] = 'medium';
  let timeStyle: Intl.DateTimeFormatOptions['timeStyle'] = includeTime ? 'short' : undefined;
  
  switch (format) {
    case 'full':
      dateStyle = 'full';
      break;
    case 'long':
      dateStyle = 'long';
      break;
    case 'short':
      dateStyle = 'short';
      break;
    default:
      dateStyle = 'medium';
  }
  
  const optionsObject: Intl.DateTimeFormatOptions = {
    dateStyle,
    timeStyle: includeTime ? (includeSeconds ? 'medium' : 'short') : undefined,
  };
  
  return new Intl.DateTimeFormat(localeCode, optionsObject).format(dateObj);
};

/**
 * Formate une date relative (ex: "il y a 2 heures", "demain")
 * 
 * @param date - Date à formater
 * @param locale - Langue (fr ou bm)
 * @returns Date relative formatée
 * 
 * @example
 * formatRelativeDate(new Date(Date.now() - 3600000)) // "il y a 1 heure"
 */
export const formatRelativeDate = (date: Date, locale: 'fr' | 'bm' = 'fr'): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  // Temps dans le futur
  if (diffMs < 0) {
    const futureMs = Math.abs(diffMs);
    const futureMins = Math.floor(futureMs / 60000);
    const futureHours = Math.floor(futureMins / 60);
    const futureDays = Math.floor(futureHours / 24);
    
    if (futureMins < 1) return locale === 'fr' ? 'À l\'instant' : 'Sisan';
    if (futureMins < 60) return locale === 'fr' ? `Dans ${futureMins} min` : `Bɛ kɛ ${futureMins} miniti kɔnɔ`;
    if (futureHours < 24) return locale === 'fr' ? `Dans ${futureHours} h` : `Bɛ kɛ ${futureHours} wɛrɛ kɔnɔ`;
    if (futureDays === 1) return locale === 'fr' ? 'Demain' : 'Sini';
    if (futureDays < 7) return locale === 'fr' ? `Dans ${futureDays} jours` : `Bɛ kɛ ${futureDays} don kɔnɔ`;
    return formatDate(date, { format: 'short', locale });
  }
  
  // Temps dans le passé
  if (diffSecs < 10) return locale === 'fr' ? 'À l\'instant' : 'Sisan';
  if (diffSecs < 60) return locale === 'fr' ? `Il y a ${diffSecs} sec` : `${diffSecs} segon kɔnɔ`;
  if (diffMins < 60) return locale === 'fr' ? `Il y a ${diffMins} min` : `${diffMins} miniti kɔnɔ`;
  if (diffHours < 24) return locale === 'fr' ? `Il y a ${diffHours} h` : `${diffHours} wɛrɛ kɔnɔ`;
  if (diffDays === 1) return locale === 'fr' ? 'Hier' : 'Kunu';
  if (diffDays < 7) return locale === 'fr' ? `Il y a ${diffDays} jours` : `${diffDays} don kɔnɔ`;
  if (diffWeeks < 4) return locale === 'fr' ? `Il y a ${diffWeeks} sem` : `${diffWeeks} dogokun kɔnɔ`;
  if (diffMonths < 12) return locale === 'fr' ? `Il y a ${diffMonths} mois` : `${diffMonths} kalo kɔnɔ`;
  
  return locale === 'fr' ? `Il y a ${diffYears} ans` : `${diffYears} san kɔnɔ`;
};

/**
 * Formate une heure
 * 
 * @param date - Date contenant l'heure
 * @param includeSeconds - Inclure les secondes
 * @returns Heure formatée (HH:MM)
 * 
 * @example
 * formatTime(new Date()) // "14:30"
 */
export const formatTime = (date: Date | string | number, includeSeconds: boolean = false): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '--:--';
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
  }).format(dateObj);
};

// ============================================
// FORMATAGE DES NOMBRES
// ============================================

/**
 * Formate un nombre avec séparateurs de milliers
 * 
 * @param number - Nombre à formater
 * @param decimals - Nombre de décimales
 * @returns Nombre formaté
 * 
 * @example
 * formatNumber(1234567) // "1 234 567"
 * formatNumber(1234.56, 2) // "1 234,56"
 */
export const formatNumber = (number: number, decimals: number = 0): string => {
  if (isNaN(number)) return '0';
  
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Formate un pourcentage
 * 
 * @param value - Valeur (0-1 ou 0-100)
 * @param isDecimal - Indique si la valeur est décimale (0-1) ou pourcentage (0-100)
 * @param decimals - Nombre de décimales
 * @returns Pourcentage formaté
 * 
 * @example
 * formatPercentage(0.25) // "25%"
 * formatPercentage(75, false) // "75%"
 */
export const formatPercentage = (value: number, isDecimal: boolean = true, decimals: number = 0): string => {
  const percent = isDecimal ? value * 100 : value;
  return `${formatNumber(percent, decimals)}%`;
};

/**
 * Formate une devise (FCFA)
 * 
 * @param amount - Montant en FCFA
 * @param showSymbol - Afficher le symbole FCFA
 * @returns Montant formaté
 * 
 * @example
 * formatCurrency(2500) // "2 500 FCFA"
 * formatCurrency(1500, true) // "1 500 FCFA"
 */
export const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
  if (isNaN(amount)) return showSymbol ? '0 FCFA' : '0';
  
  const formatted = formatNumber(amount, 0);
  return showSymbol ? `${formatted} FCFA` : formatted;
};

// ============================================
// FORMATAGE DES TÉLÉPHONES
// ============================================

/**
 * Formate un numéro de téléphone au format Mali
 * Format: 77 12 34 56 7
 * 
 * @param phone - Numéro de téléphone
 * @returns Téléphone formaté
 * 
 * @example
 * formatPhoneNumber('771234567') // "77 12 34 56 7"
 * formatPhoneNumber('+223771234567') // "77 12 34 56 7"
 */
export const formatPhoneNumber = (phone: string): string => {
  // Nettoyer le numéro (garder uniquement les chiffres)
  const cleaned = phone.replace(/\D/g, '');
  
  // Extraire les 9 derniers chiffres (numéro Mali)
  const nationalNumber = cleaned.slice(-9);
  
  if (nationalNumber.length !== 9) {
    return phone;
  }
  
  // Formater: XX XX XX XX X
  const parts = [
    nationalNumber.slice(0, 2),
    nationalNumber.slice(2, 4),
    nationalNumber.slice(4, 6),
    nationalNumber.slice(6, 8),
    nationalNumber.slice(8, 9),
  ];
  
  return parts.join(' ');
};

/**
 * Valide un numéro de téléphone au format Mali
 * 
 * @param phone - Numéro de téléphone à valider
 * @returns true si le format est valide
 * 
 * @example
 * isValidPhoneNumber('771234567') // true
 * isValidPhoneNumber('123456') // false
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  const nationalNumber = cleaned.slice(-9);
  return nationalNumber.length === 9 && /^[1-9]/.test(nationalNumber);
};

// ============================================
// FORMATAGE DES TEXTES
// ============================================

/**
 * Capitalise la première lettre d'une chaîne
 * 
 * @param text - Texte à capitaliser
 * @returns Texte avec première lettre en majuscule
 * 
 * @example
 * capitalize('bonjour') // "Bonjour"
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitalise la première lettre de chaque mot
 * 
 * @param text - Texte à capitaliser
 * @returns Texte avec chaque mot capitalisé
 * 
 * @example
 * capitalizeEachWord('bonjour le monde') // "Bonjour Le Monde"
 */
export const capitalizeEachWord = (text: string): string => {
  if (!text) return '';
  return text.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Tronque un texte à une longueur maximale
 * 
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale
 * @param suffix - Suffixe à ajouter (défaut: '...')
 * @returns Texte tronqué
 * 
 * @example
 * truncate('Un texte très long', 10) // "Un texte..."
 */
export const truncate = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// ============================================
// FORMATAGE DES DURÉES
// ============================================

/**
 * Formate une durée en secondes
 * 
 * @param seconds - Durée en secondes
 * @param format - Format souhaité ('full', 'short', 'compact')
 * @returns Durée formatée
 * 
 * @example
 * formatDuration(3665) // "1h 1min 5s"
 * formatDuration(3665, 'short') // "1h 1min"
 * formatDuration(3665, 'compact') // "1h"
 */
export const formatDuration = (
  seconds: number,
  format: 'full' | 'short' | 'compact' = 'full'
): string => {
  if (isNaN(seconds) || seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(format === 'compact' ? `${hours}h` : `${hours}${format === 'full' ? 'h' : 'h'}`);
  }
  if (minutes > 0 && (hours === 0 || format !== 'compact')) {
    parts.push(format === 'compact' ? `${minutes}min` : `${minutes}${format === 'full' ? 'min' : 'min'}`);
  }
  if (secs > 0 && format === 'full' && (hours === 0 && minutes === 0)) {
    parts.push(`${secs}s`);
  }
  
  if (parts.length === 0) return '0s';
  
  return parts.join(' ');
};

// ============================================
// FORMATAGE AGRICOLE
// ============================================

/**
 * Formate une superficie en hectares
 * 
 * @param hectares - Superficie en hectares
 * @param decimals - Nombre de décimales
 * @returns Superficie formatée
 * 
 * @example
 * formatSuperficie(5.5) // "5,5 ha"
 * formatSuperficie(2) // "2 ha"
 */
export const formatSuperficie = (hectares: number, decimals: number = 1): string => {
  if (isNaN(hectares)) return '0 ha';
  return `${formatNumber(hectares, decimals)} ha`;
};

/**
 * Formate un rendement agricole (tonnes/hectare)
 * 
 * @param yieldValue - Rendement en tonnes/hectare
 * @param decimals - Nombre de décimales
 * @returns Rendement formaté
 * 
 * @example
 * formatYield(3.5) // "3,5 t/ha"
 */
export const formatYield = (yieldValue: number, decimals: number = 1): string => {
  if (isNaN(yieldValue)) return '0 t/ha';
  return `${formatNumber(yieldValue, decimals)} t/ha`;
};

/**
 * Formate une température
 * 
 * @param celsius - Température en degrés Celsius
 * @param showUnit - Afficher l'unité
 * @returns Température formatée
 * 
 * @example
 * formatTemperature(25) // "25°C"
 */
export const formatTemperature = (celsius: number, showUnit: boolean = true): string => {
  if (isNaN(celsius)) return showUnit ? '--°C' : '--';
  return showUnit ? `${Math.round(celsius)}°C` : `${Math.round(celsius)}`;
};

/**
 * Formate une probabilité de pluie
 * 
 * @param probability - Probabilité (0-1 ou 0-100)
 * @param isDecimal - Indique si la valeur est décimale
 * @returns Probabilité formatée
 * 
 * @example
 * formatRainProbability(0.75) // "75%"
 * formatRainProbability(30, false) // "30%"
 */
export const formatRainProbability = (probability: number, isDecimal: boolean = true): string => {
  const percent = isDecimal ? probability * 100 : probability;
  return `${Math.round(percent)}%`;
};

// ============================================
// FORMATAGE DES COORDONNÉES
// ============================================

/**
 * Formate des coordonnées GPS
 * 
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @returns Coordonnées formatées
 * 
 * @example
 * formatCoordinates(12.639, -8.002) // "12.639, -8.002"
 */
export const formatCoordinates = (latitude: number, longitude: number, decimals: number = 3): string => {
  if (isNaN(latitude) || isNaN(longitude)) return '--, --';
  return `${formatNumber(latitude, decimals)}, ${formatNumber(longitude, decimals)}`;
};

// ============================================
// FORMATAGE DES NOMS
// ============================================

/**
 * Formate un nom complet
 * 
 * @param firstName - Prénom
 * @param lastName - Nom de famille
 * @param order - Ordre d'affichage ('first_last' ou 'last_first')
 * @returns Nom complet formaté
 * 
 * @example
 * formatFullName('Mamadou', 'Diallo') // "Mamadou Diallo"
 * formatFullName('Mamadou', 'Diallo', 'last_first') // "Diallo Mamadou"
 */
export const formatFullName = (
  firstName: string,
  lastName: string,
  order: 'first_last' | 'last_first' = 'first_last'
): string => {
  const first = capitalize(firstName);
  const last = capitalize(lastName);
  
  return order === 'first_last' ? `${first} ${last}` : `${last} ${first}`;
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default {
  // Dates
  formatDate,
  formatRelativeDate,
  formatTime,
  
  // Nombres
  formatNumber,
  formatPercentage,
  formatCurrency,
  
  // Téléphone
  formatPhoneNumber,
  isValidPhoneNumber,
  
  // Textes
  capitalize,
  capitalizeEachWord,
  truncate,
  
  // Durées
  formatDuration,
  
  // Agricole
  formatSuperficie,
  formatYield,
  formatTemperature,
  formatRainProbability,
  
  // Coordonnées
  formatCoordinates,
  
  // Noms
  formatFullName,
};