import type { HtmlResult } from '../types/chat';

const HTML_MARKER = '/html/';

export function deriveRelativeHtmlPath(result: HtmlResult): string | null {
  const markerIndex = result.path.lastIndexOf(HTML_MARKER);
  if (markerIndex === -1) {
    return null;
  }
  return result.path.slice(markerIndex);
}

export function resolveHtmlPreviewUrl(result: HtmlResult): string | null {
  const relative = deriveRelativeHtmlPath(result);
  if (!relative) {
    return null;
  }

  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
  if (!base) {
    return relative;
  }
  return `${base}${relative}`;
}
