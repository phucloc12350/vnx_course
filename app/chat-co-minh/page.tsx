'use client';

import React, { useCallback } from 'react';
import ChatWindow from '@/components/ChatWindow';
import HistoryPanel from '@/components/HistoryPanel';
import {
  useChatHistory,
  messagesToStored,
  storedToMessages,
} from '@/hooks/useChatHistory';

export default function ChatPage() {
  const {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    updateConversation,
    deleteConversation,
  } = useChatHistory();

  const handleMessagesUpdate = useCallback(
    (msgs: any[]) => {
      const stored = messagesToStored(msgs);
      if (!activeId) {
        const firstUser = stored.find((m) => m.role === 'user');
        const newConv = createConversation(firstUser?.content);
        updateConversation(newConv.id, stored);
      } else {
        updateConversation(activeId, stored);
      }
    },
    [activeId, createConversation, updateConversation]
  );

  const handleNewChat = useCallback(() => {
    setActiveId(null as any);
  }, [setActiveId]);

  const initialMessages = activeConversation
    ? storedToMessages(activeConversation.messages)
    : [];

  const chatKey = activeId ?? 'new-chat';

  return (
    <div style={{ display: 'flex', height: '100vh', minWidth: 0 }}>
      <ChatWindow
        key={chatKey}
        initialMessages={initialMessages}
        onMessagesUpdate={handleMessagesUpdate}
      />
      <HistoryPanel
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewChat}
        onDelete={deleteConversation}
      />
    </div>
  );
}
