import { useEffect, useRef } from 'react'
import './App.css'

import { ChatComposer } from './components/ChatComposer'
import { EmptyState } from './components/EmptyState'
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
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, assistantIsThinking, htmlResult])

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
            <div className="chat-card__scroller" ref={scrollRef}>
              {hasMessages ? (
                <MessageList
                  messages={messages}
                  assistantIsThinking={assistantIsThinking}
                  htmlResult={htmlResult}
                  htmlPreview={htmlPreview}
                  isLoadingPreview={isLoadingPreview}
                  htmlPreviewError={htmlPreviewError}
                  onRefreshPreview={retryPreview}
                />
              ) : (
                <div className="chat-placeholder">
                  <p>The agent is ready. Ask your first question to get started.</p>
                </div>
              )}
            </div>
            <SuggestedActionTag action={suggestedAction} />
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
