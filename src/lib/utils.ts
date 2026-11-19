import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function generateSubmissionId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MS-${year}-${random}`;
}

export function getCurrencySymbol(currency: string = "USD"): string {
  const code = (currency || "").trim().toUpperCase();
  const map: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    MYR: "RM",
    BDT: "৳",
    INR: "₹",
    CAD: "CA$",
    AUD: "AU$",
    JPY: "¥",
    CNY: "¥",
    SGD: "S$",
    NZD: "NZ$",
    CHF: "CHF",
    PHP: "₱",
    THB: "฿",
    IDR: "Rp",
    VND: "₫",
    KRW: "₩",
    NGN: "₦",
    PKR: "₨",
    SAR: "SAR",
    AED: "AED",
    TRY: "₺",
    BRL: "R$",
    ZAR: "R",
  };
  return map[code] || code;
}

export function formatPrice(amount: number | string, currency: string = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbol = getCurrencySymbol(currency);
  const formattedNum = isNaN(num) ? amount : num.toLocaleString();

  if (symbol && symbol !== currency.trim().toUpperCase()) {
    return symbol.length > 1 ? `${symbol} ${formattedNum}` : `${symbol}${formattedNum}`;
  }
  return `${formattedNum} ${currency.trim().toUpperCase()}`;
}

export {
  extractErrorMessage,
  getApiResponseError,
  getErrorMessage,
  formatValidationDetails,
  getStatusErrorMessage,
} from "./errorUtils";

