import './App.css'

import { ChatComposer } from './components/ChatComposer'
import { EmptyState } from './components/EmptyState'
import { HtmlPreview } from './components/HtmlPreview'
import { MessageList } from './components/MessageList'
import { SuggestedActionTag } from './components/SuggestedActionTag'
import { useChatSession } from './hooks/useChatSession'

function App() {
  const {
    chat,
    messages,
    isReady,
    isCreating,
    isSending,
    assistantIsThinking,
    error,
    suggestedAction,
    htmlResult,
    htmlPreview,
    isLoadingPreview,
    htmlPreviewError,
    createChatSession,
    sendMessage,
    retryPreview,
  } = useChatSession()

  const hasMessages = messages.length > 0

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">Dashboard Agent</h1>
          <p className="app-subtitle">
            Chat with the backend AI agent, iterate on requirements, and preview generated dashboards.
          </p>
        </div>
        <div className="app-header__actions">
          {chat?.phase && (
            <span className="phase-pill" title="Current phase">
              {chat.phase.toLowerCase()}
            </span>
          )}
          <button
            type="button"
            className="button-secondary"
            onClick={createChatSession}
            disabled={isCreating}
          >
            {isCreating ? 'Creating…' : 'New chat'}
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {!isReady && (
        <EmptyState isCreating={isCreating} onCreate={createChatSession} />
      )}

      {isReady && (
        <main className="chat-stage">
          <section className="chat-card">
            <div className="chat-card__scroller">
              {hasMessages ? (
                <MessageList messages={messages} assistantIsThinking={assistantIsThinking} />
              ) : (
                <div className="chat-placeholder">
                  <p>The agent is ready. Ask your first question to get started.</p>
                </div>
              )}
            </div>
            <SuggestedActionTag action={suggestedAction} />
            {htmlResult && (
              <HtmlPreview
                result={htmlResult}
                html={htmlPreview}
                isLoading={isLoadingPreview}
                error={htmlPreviewError}
                onRetry={retryPreview}
              />
            )}
            <ChatComposer
              onSend={sendMessage}
              disabled={!isReady}
              isSending={isSending}
            />
          </section>
        </main>
      )}
    </div>
  )
}

export default App
