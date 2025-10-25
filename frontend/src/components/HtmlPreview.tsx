import type { HtmlResult } from '../types/chat';
import { resolveHtmlPreviewUrl } from '../utils/path';

interface HtmlPreviewProps {
  result: HtmlResult | null;
  html: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function HtmlPreview({ result, html, isLoading, error, onRetry }: HtmlPreviewProps) {
  if (!result) {
    return null;
  }

  const previewUrl = resolveHtmlPreviewUrl(result);

  return (
    <section className="html-preview">
      <header className="html-preview__header">
        <div>
          <h3 className="html-preview__title">Dashboard preview</h3>
          <p className="html-preview__subtitle">
            {result.message} ({result.filename})
          </p>
        </div>
        <div className="html-preview__controls">
          <button type="button" className="button-secondary" onClick={onRetry} disabled={isLoading}>
            Refresh preview
          </button>
          {previewUrl && (
            <button
              type="button"
              className="button-primary"
              onClick={() => window.open(previewUrl, '_blank', 'noopener')}
            >
              Open in new tab
            </button>
          )}
        </div>
      </header>

      <div className="html-preview__body">
        {isLoading && <div className="html-preview__loading">Loading preview…</div>}
        {!isLoading && html && (
          <iframe
            className="html-preview__frame"
            title="Generated dashboard preview"
            srcDoc={html}
          />
        )}
        {!isLoading && !html && !error && (
          <p className="html-preview__placeholder">
            Preview will appear here once available. Use the open button if nothing shows up.
          </p>
        )}
        {error && <p className="html-preview__error">{error}</p>}
      </div>

      <footer className="html-preview__footer">
        <span className="html-preview__path-label">File saved at:</span>
        <code className="html-preview__path">{result.path}</code>
      </footer>
    </section>
  );
}
