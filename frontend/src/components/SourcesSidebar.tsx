interface SourcesSidebarProps {
  relevantFiles: string[];
}

export function SourcesSidebar({ relevantFiles }: SourcesSidebarProps) {
  return (
    <aside className="sources-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">📄 Source Files</h2>
        <p className="sidebar-subtitle">
          {relevantFiles.length > 0
            ? `${relevantFiles.length} file${relevantFiles.length !== 1 ? 's' : ''} in use`
            : 'No files selected yet'}
        </p>
      </div>
      <div className="sidebar-content">
        {relevantFiles.length === 0 ? (
          <div className="empty-sources">
            <p>Ask a question to identify relevant source files.</p>
          </div>
        ) : (
          <ul className="sources-list">
            {relevantFiles.map((file, index) => (
              <li key={index} className="source-item">
                <span className="source-icon">📋</span>
                <span className="source-name" title={file}>
                  {file}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

