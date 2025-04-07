import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind CSS classes to avoid conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 */
export function formatCurrency(value: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a large number with K/M/B suffixes
 */
export function formatCompactNumber(value: number): string {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Generate a gradient color based on a value between 0 and 1
 */
export function getGradientColor(value: number): string {
  // Ensure value is between 0 and 1
  const safeValue = Math.max(0, Math.min(1, value));
  
  // Red to yellow to green gradient
  if (safeValue < 0.5) {
    // Red to yellow (0 to 0.5)
    const r = 255;
    const g = Math.round(255 * (safeValue * 2));
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to green (0.5 to 1)
    const r = Math.round(255 * (1 - (safeValue - 0.5) * 2));
    const g = 255;
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Group an array of objects by a specific key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
} 