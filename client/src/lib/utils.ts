import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phoneNumberString: string) {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phoneNumberString;
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'text-amber-500 bg-amber-100';
    case 'assigned':
      return 'text-blue-500 bg-blue-100';
    case 'in-transit':
      return 'text-blue-500 bg-blue-100';
    case 'completed':
      return 'text-green-500 bg-green-100';
    case 'canceled':
      return 'text-red-500 bg-red-100';
    default:
      return 'text-gray-500 bg-gray-100';
  }
}
