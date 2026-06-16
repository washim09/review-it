/**
 * Link Health Checker
 * Checks approved affiliate URLs for availability and reports status.
 */

export interface LinkHealthResult {
  reviewId: number;
  url: string;
  health: 'HEALTHY' | 'BROKEN' | 'REDIRECT_CHANGED' | 'UNKNOWN';
  httpStatus: number | null;
  error?: string;
}

/**
 * Check a single URL's health by making a HEAD request (falls back to GET).
 */
export async function checkLinkHealth(url: string): Promise<{
  health: 'HEALTHY' | 'BROKEN' | 'REDIRECT_CHANGED' | 'UNKNOWN';
  httpStatus: number | null;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // Use HEAD first (lighter), fall back to GET if HEAD fails
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Riviewit-LinkChecker/1.0',
        },
      });
    } catch {
      // Some servers block HEAD, try GET
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Riviewit-LinkChecker/1.0',
        },
      });
    }

    clearTimeout(timeout);
    const status = response.status;

    if (status >= 200 && status < 400) {
      return { health: 'HEALTHY', httpStatus: status };
    } else if (status === 404 || status === 410) {
      return { health: 'BROKEN', httpStatus: status, error: `HTTP ${status}` };
    } else if (status >= 500) {
      return { health: 'UNKNOWN', httpStatus: status, error: `Server error: ${status}` };
    } else {
      return { health: 'UNKNOWN', httpStatus: status, error: `Unexpected status: ${status}` };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { health: 'BROKEN', httpStatus: null, error: 'Request timed out (10s)' };
    }
    return { health: 'BROKEN', httpStatus: null, error: err.message || 'Network error' };
  }
}
