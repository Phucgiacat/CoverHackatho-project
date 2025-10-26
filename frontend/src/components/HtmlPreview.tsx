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

  const handleDownload = () => {
    if (!html && !previewUrl) {
      alert('No HTML content available to download');
      return;
    }

    const content = html || '';
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename || 'dashboard.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="html-preview">
      <header className="html-preview__header">
        <div>
          <h3 className="html-preview__title">📊 Dashboard Preview</h3>
          <p className="html-preview__subtitle">
            {result.message} ({result.filename})
          </p>
        </div>
        <div className="html-preview__controls">
          <button 
            type="button" 
            className="button-icon" 
            onClick={onRetry} 
            disabled={isLoading}
            title="Refresh preview"
          >
            🔄
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={handleDownload}
            disabled={!html && !previewUrl}
            title="Download dashboard"
          >
            📥 Download
          </button>
          {previewUrl && (
            <button
              type="button"
              className="button-primary"
              onClick={() => window.open(previewUrl, '_blank', 'noopener')}
            >
              🔗 Open in new tab
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
            sandbox="allow-scripts allow-same-origin"
          />
        )}
        {!isLoading && !html && !error && previewUrl && (
          <iframe
            className="html-preview__frame"
            title="Generated dashboard preview"
            src={previewUrl}
            sandbox="allow-scripts allow-same-origin"
          />
        )}
        {!isLoading && !html && !error && !previewUrl && (
          <p className="html-preview__placeholder">
            Preview will appear here once available. Use the open button if nothing shows up.
          </p>
        )}
        {error && (
          <div className="html-preview__error">
            <p>{error}</p>
            {previewUrl && (
              <button
                type="button"
                className="button-secondary"
                onClick={() => window.open(previewUrl, '_blank', 'noopener')}
              >
                Try opening in new tab
              </button>
            )}
          </div>
        )}
      </div>

      <footer className="html-preview__footer">
        <span className="html-preview__path-label">File saved at:</span>
        <code className="html-preview__path">{result.path}</code>
      </footer>
    </section>
  );
}
