import type { HtmlResult } from '../types/chat';

export function deriveRelativeHtmlPath(result: HtmlResult): string | null {
  if (result.filename) {
    return `/html/${result.filename}`;
  }
  const match = result.path.match(/[/\\]html[/\\]([^/\\]+\.html)$/);
  if (match) {
    return `/html/${match[1]}`;
  }
  return null;
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
