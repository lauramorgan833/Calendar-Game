import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for combining and merging CSS class names
 * 
 * This function combines clsx (for conditional class names) with tailwind-merge
 * (for intelligent Tailwind CSS class merging). It's the standard utility used
 * throughout the application for dynamic className generation.
 * 
 * @param inputs - Variable number of class values (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 * 
 * Examples:
 * - cn('px-2 py-1', 'bg-blue-500') -> 'px-2 py-1 bg-blue-500'
 * - cn('px-2', { 'bg-red-500': isError }) -> 'px-2 bg-red-500' (if isError is true)
 * - cn('bg-blue-500', 'bg-red-500') -> 'bg-red-500' (tailwind-merge handles conflicts)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
