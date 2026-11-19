/**
 * Utilities for formatting and extracting specific error messages
 * for toast notifications and user feedback across the journal application.
 */

/**
 * Formats validation details (e.g., Zod safeParse format() output) into human-readable text.
 */
export function formatValidationDetails(details: any): string | null {
  if (!details) return null;

  if (typeof details === "string") return details;

  const messages: string[] = [];

  if (Array.isArray(details)) {
    for (const item of details) {
      if (typeof item === "string") {
        messages.push(item);
      } else if (item && typeof item === "object") {
        const path = item.path ? (Array.isArray(item.path) ? item.path.join(".") : item.path) : "";
        const msg = item.message || JSON.stringify(item);
        messages.push(path ? `${path}: ${msg}` : msg);
      }
    }
  } else if (typeof details === "object") {
    // Zod .format() shape: { _errors: [], fieldName: { _errors: ["message"] }, nested: { ... } }
    const traverse = (obj: Record<string, any>, prefix = "") => {
      for (const [key, val] of Object.entries(obj)) {
        if (key === "_errors") {
          if (Array.isArray(val) && val.length > 0) {
            const prefixStr = prefix ? `${prefix}: ` : "";
            for (const msg of val) {
              messages.push(`${prefixStr}${msg}`);
            }
          }
        } else if (val && typeof val === "object") {
          const nextPrefix = prefix ? `${prefix}.${key}` : key;
          traverse(val, nextPrefix);
        }
      }
    };
    traverse(details);
  }

  return messages.length > 0 ? messages.join("; ") : null;
}

/**
 * Fallback message based on HTTP status code.
 */
export function getStatusErrorMessage(statusCode: number, fallback = "An unexpected error occurred"): string {
  switch (statusCode) {
    case 400:
      return "Bad request. Please verify the submitted data.";
    case 401:
      return "Unauthorized access. Please log in as an administrator.";
    case 403:
      return "Access denied (403 Forbidden). You do not have permission to perform this action.";
    case 404:
      return "Resource not found (404).";
    case 409:
      return "Conflict: A record with these details already exists.";
    case 413:
      return "File too large: The uploaded file exceeds the allowed upload limit.";
    case 429:
      return "Too many requests. Please wait a moment before trying again.";
    case 500:
      return "Internal server error (500). Please check server logs or configuration.";
    case 502:
      return "Bad gateway (502). The upstream server is unreachable.";
    case 503:
      return "Service unavailable (503). The server is temporarily unable to handle the request.";
    case 504:
      return "Gateway timeout (504). The server took too long to respond.";
    default:
      return `${fallback} (Status ${statusCode})`;
  }
}

/**
 * Extracts the most informative error message from an API JSON response object.
 */
export function extractErrorMessage(data: any, statusCode?: number, fallback = "An unexpected error occurred"): string {
  if (!data) {
    if (statusCode) return getStatusErrorMessage(statusCode, fallback);
    return fallback;
  }

  if (typeof data === "string") {
    const trimmed = data.trim();
    // Try to parse if it's stringified JSON
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return extractErrorMessage(parsed, statusCode, fallback);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  // 1. Check for detailed validation errors first
  const detailsFormatted = formatValidationDetails(data.details || data.errors);

  // 2. Main error string
  let mainError = data.error || data.message;

  // Handle Mongoose duplicate key error cleanly
  if (typeof mainError === "string" && mainError.includes("E11000 duplicate key")) {
    const fieldMatch = mainError.match(/index:\s+([a-zA-Z0-9_]+)_1/);
    const field = fieldMatch ? fieldMatch[1] : "field";
    return `A duplicate entry already exists for '${field}'. Please provide a unique value.`;
  }

  if (mainError && typeof mainError === "string") {
    if (detailsFormatted) {
      if (mainError.toLowerCase().includes("validation failed")) {
        return `Validation Error: ${detailsFormatted}`;
      }
      return `${mainError} (${detailsFormatted})`;
    }
    return mainError;
  }

  if (detailsFormatted) {
    return detailsFormatted;
  }

  if (statusCode) {
    return getStatusErrorMessage(statusCode, fallback);
  }

  return fallback;
}

/**
 * Safely parses any fetch Response and returns a clean, detailed error string.
 * Never throws JSON parse errors or exposes raw HTML doctype snippets to users.
 */
export async function getApiResponseError(res: Response, fallback = "Request failed"): Promise<string> {
  try {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return extractErrorMessage(data, res.status, fallback);
    }
    const text = await res.text();
    if (text && text.trim().length > 0) {
      const trimmed = text.trim();
      // If it's not raw HTML, return it
      if (!trimmed.startsWith("<!DOCTYPE") && !trimmed.startsWith("<html") && trimmed.length < 300) {
        return trimmed;
      }
    }
  } catch {
    // If response body reading fails, continue to status fallback
  }

  return getStatusErrorMessage(res.status, fallback);
}

/**
 * Parses any caught exception or unknown error into a clear, specific message.
 */
export function getErrorMessage(err: any, fallback = "An unexpected error occurred"): string {
  if (!err) return fallback;
  if (typeof err === "string") return extractErrorMessage(err, undefined, fallback);
  if (err.message && typeof err.message === "string") {
    return extractErrorMessage(err.message, undefined, fallback);
  }
  return fallback;
}
