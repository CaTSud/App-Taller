import type { TrafficLightColor } from '@/types/database';

/**
 * Parses a date string that can be in ISO format (YYYY-MM-DD) 
 * or European format (DD/MM/YYYY)
 * IMPORTANT: Always interprets slash-separated dates as DD/MM/YYYY (European)
 */
export function parseFlexibleDate(dateString: string | null): Date | null {
    if (!dateString) return null;

    // Clean the string (remove any invisible characters)
    const cleanDate = dateString.toString().trim();

    // Try European format: DD/MM/YYYY
    const europeanMatch = cleanDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (europeanMatch) {
        const day = parseInt(europeanMatch[1], 10);
        const month = parseInt(europeanMatch[2], 10) - 1; // Months are 0-indexed
        const year = parseInt(europeanMatch[3], 10);
        return new Date(year, month, day);
    }

    // Try ISO format: YYYY-MM-DD
    const isoMatch = cleanDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10) - 1;
        const day = parseInt(isoMatch[3], 10);
        return new Date(year, month, day);
    }

    // No fallback to prevent American format interpretation
    return null;
}

/**
 * Calculates days until expiration
 * Supports both ISO and Spanish date formats
 */
export function calculateDaysUntil(dateString: string | null): number | null {
    if (!dateString) return null;

    const expiryDate = parseFlexibleDate(dateString);
    if (!expiryDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Gets traffic light color based on date
 */
export function getTrafficLightColor(dateString: string | null): TrafficLightColor {
    if (!dateString) return 'yellow'; // No data

    const days = calculateDaysUntil(dateString);
    if (days === null) return 'yellow';

    if (days < 0) return 'red';      // Expired
    if (days <= 30) return 'yellow'; // Warning
    return 'green';                   // OK
}

/**
 * Formats a date string to Spanish locale display
 * Input can be ISO or Spanish format
 */
export function formatDateES(dateString: string): string {
    const date = parseFlexibleDate(dateString);
    if (!date) return dateString; // Return original if unparseable

    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
    });
}

/**
 * Converts a date to Spanish format D/M/YYYY (for saving to Supabase)
 */
export function toSpanishFormat(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
