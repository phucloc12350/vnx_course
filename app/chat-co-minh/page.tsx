'use client';

import React, { useCallback, useRef, useState } from 'react';
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
    setActiveId,
    createConversation,
    updateConversation,
    deleteConversation,
  } = useChatHistory();

  /**
   * sessionKey điều khiển khi nào ChatWindow remount:
   * - Chỉ thay đổi khi user BẤM "Chat mới" hoặc CHỌN conversation cũ
   * - KHÔNG thay đổi khi auto-save conversation mới → tránh bug messages biến mất
   */
  const [sessionKey, setSessionKey] = useState('new-chat');

  /**
   * savedConvIdRef: lưu id conversation đang được save trong session này
   * Dùng ref thay vì state để tránh re-render / key-change khi lần đầu tạo conversation
   */
  const savedConvIdRef = useRef<string | null>(null);

  // Khi AI trả lời xong → lưu vào localStorage
  const handleMessagesUpdate = useCallback(
    (msgs: any[]) => {
      const stored = messagesToStored(msgs);
      if (!savedConvIdRef.current) {
        // Lần đầu save: tạo conversation mới
        const firstUser = stored.find((m) => m.role === 'user');
        const newConv = createConversation(firstUser?.content);
        savedConvIdRef.current = newConv.id; // lưu bằng ref → không đổi key ChatWindow
        updateConversation(newConv.id, stored);
      } else {
        // Các lần tiếp theo: update conversation hiện có
        updateConversation(savedConvIdRef.current, stored);
      }
    },
    [createConversation, updateConversation] // không phụ thuộc activeId → stable callback
  );

  // Bắt đầu chat mới
  const handleNewChat = useCallback(() => {
    setActiveId(null as any);
    savedConvIdRef.current = null;
    setSessionKey('new-' + Date.now()); // đổi key → remount ChatWindow với empty state
  }, [setActiveId]);

  // Chọn conversation cũ từ lịch sử
  const handleSelectConv = useCallback(
    (id: string) => {
      setActiveId(id);
      savedConvIdRef.current = id;
      setSessionKey(id); // đổi key → remount ChatWindow với messages cũ
    },
    [setActiveId]
  );

  // Lấy messages của conversation đang được chọn để load vào ChatWindow
  const selectedConv = conversations.find((c) => c.id === activeId);
  const initialMessages =
    sessionKey !== 'new-chat' && !sessionKey.startsWith('new-') && selectedConv
      ? storedToMessages(selectedConv.messages)
      : [];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Wrapper flex: 1 để ChatWindow fill chiều ngang còn lại */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <ChatWindow
          key={sessionKey}
          initialMessages={initialMessages}
          onMessagesUpdate={handleMessagesUpdate}
        />
      </div>

      <HistoryPanel
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConv}
        onNew={handleNewChat}
        onDelete={deleteConversation}
      />
    </div>
  );
}
