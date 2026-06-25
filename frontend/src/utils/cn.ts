import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge tailwind classes with clsx.
 * Even though we use Vanilla CSS primarily, this utility is great
 * for combining standard classes dynamically.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
