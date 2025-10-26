import { useEffect, useRef } from 'react'
import './App.css'

import { ChatComposer } from './components/ChatComposer'
import { EmptyState } from './components/EmptyState'
import { MessageList } from './components/MessageList'
import { SuggestedActionTag } from './components/SuggestedActionTag'
import { SourcesSidebar } from './components/SourcesSidebar'
import { ChatsSidebar } from './components/ChatsSidebar'
import { useChatSession } from './hooks/useChatSession'

function App() {
  const {
    chat,
    messages,
    isReady,
    isCreating,
    isSending,
    isLoadingChat,
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
    loadChat,
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

  const handleSelectChat = (chatId: string) => {
    if (chatId !== chat?.id) {
      loadChat(chatId);
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="app-header-content">
          <div>
            <h1 className="app-title">📊 Dashboard Agent</h1>
            <p className="app-subtitle">
              AI-powered dashboard generation from your documents
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
              {isCreating ? 'Creating…' : '✨ New chat'}
            </button>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {/* Main 3-column layout */}
      <div className="app-main">
        {/* Left Sidebar - Sources */}
        <SourcesSidebar relevantFiles={chat?.relevantFiles || []} />

        {/* Center - Chat Area */}
        <main className="chat-main">
          {!isReady && !isLoadingChat ? (
            <EmptyState isCreating={isCreating} onCreate={createChatSession} />
          ) : isLoadingChat ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Loading chat...</p>
            </div>
          ) : (
            <>
              <div className="chat-messages" ref={scrollRef}>
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
                    <p>💬 The agent is ready. Ask your first question to get started.</p>
                  </div>
                )}
              </div>
              
              {/* Fixed Chat Input at Bottom */}
              <div className="chat-input-container">
                <SuggestedActionTag action={suggestedAction} />
                <ChatComposer
                  onSend={sendMessage}
                  disabled={!isReady || isLoadingChat}
                  isSending={isSending}
                />
              </div>
            </>
          )}
        </main>

        {/* Right Sidebar - Chat History */}
        <ChatsSidebar currentChatId={chat?.id || null} onSelectChat={handleSelectChat} />
      </div>
    </div>
  )
}

export default App
