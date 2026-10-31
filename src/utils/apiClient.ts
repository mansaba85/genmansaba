/**
 * Resilient API Client for MA NU 01 Banyuputih Batang
 * Automatically handles:
 * 1. Nginx warmup pages (warmup.html when server.ts is restarting) via automatic backoff retry.
 * 2. AI Studio iframe cookie/token expiration (cookie_check.html after 5-min TTL) via silent hidden iframe refresh.
 * 3. Reverse proxy or static fallback responses without throwing uncaught runtime exceptions.
 */

let activeAuthRefreshPromise: Promise<void> | null = null;

export async function refreshProxyAuthSilently(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (activeAuthRefreshPromise) return activeAuthRefreshPromise;

  activeAuthRefreshPromise = new Promise<void>((resolve) => {
    try {
      // 1. Set the test cookie expected by Nginx Lua auth script
      document.cookie = `__SECURE-aistudio_auth_flow_may_set_cookies=true; Path=/; Secure; SameSite=None; Domain=${window.location.hostname}; Partitioned; Max-Age=60;`;

      // 2. Mount a hidden 0x0 iframe to /api/health to complete the 302 auth-bridge handshake
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.setAttribute('aria-hidden', 'true');

      let cleanedUp = false;
      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        try {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        } catch {}
        activeAuthRefreshPromise = null;
        resolve();
      };

      const timer = setTimeout(cleanup, 2800);
      iframe.onload = () => {
        clearTimeout(timer);
        setTimeout(cleanup, 250);
      };
      iframe.onerror = () => {
        clearTimeout(timer);
        cleanup();
      };

      iframe.src = `/api/health?__storage_access_granted=1&_t=${Date.now()}`;
      document.body.appendChild(iframe);
    } catch {
      activeAuthRefreshPromise = null;
      resolve();
    }
  });

  return activeAuthRefreshPromise;
}

export async function fetchApiJson<T = any>(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Keep the short-lived cookie-check flag fresh before API calls
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        try {
          document.cookie = `__SECURE-aistudio_auth_flow_may_set_cookies=true; Path=/; Secure; SameSite=None; Domain=${window.location.hostname}; Partitioned; Max-Age=60;`;
        } catch {}
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin',
      });

      const rawText = await response.text();
      const trimmed = rawText.trim();

      // Try parsing as JSON first regardless of content-type header
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          return JSON.parse(trimmed) as T;
        } catch {}
      }

      const lower = trimmed.toLowerCase();
      const isHtml =
        lower.startsWith('<!doctype html') ||
        lower.startsWith('<html') ||
        lower.includes('<head>');

      if (isHtml && attempt < maxRetries) {
        const isWarmup =
          trimmed.includes('Starting Server') ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504;

        const isCookieCheck =
          trimmed.includes('Cookie check') ||
          trimmed.includes('__SECURE-aistudio_auth_flow_may_set_cookies') ||
          (response.url && response.url.includes('__cookie_check'));

        if (isWarmup) {
          // Dev server is restarting; wait 1.5s and retry
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }

        if (isCookieCheck || attempt === 0) {
          // Auth token in Nginx expired; refresh via hidden iframe and retry
          await refreshProxyAuthSilently();
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }

        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      // If all retries exhausted and response is still HTML
      if (isHtml) {
        return {
          success: false,
          connected: false,
          isHtmlFallback: true,
          statusCode: response.status,
          message:
            'Server mengembalikan halaman HTML, bukan JSON API. Jika di Portainer/Docker, pastikan container sudah di-rebuild (docker compose up -d --build).',
          error:
            'Respons server berupa halaman HTML (sesi proxy sedang disegarkan atau container belum menjalankan backend terbaru).',
        } as unknown as T;
      }

      return {
        success: false,
        connected: false,
        statusCode: response.status,
        error: `Respons server tidak valid (${response.status}): ${trimmed.slice(0, 100)}`,
        message: `Respons server tidak valid (${response.status}).`,
      } as unknown as T;
    } catch (err: any) {
      if (attempt < maxRetries) {
        await refreshProxyAuthSilently();
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      return {
        success: false,
        connected: false,
        error: err?.message || 'Koneksi jaringan ke server terputus.',
        message: err?.message || 'Gagal menghubungi server backend.',
      } as unknown as T;
    }
  }

  return {
    success: false,
    connected: false,
    error: 'Batas percobaan koneksi ke server terlampaui.',
  } as unknown as T;
}
