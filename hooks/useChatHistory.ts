'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation, StoredMessage } from '@/types/chat';

/** Chuyển message từ AI SDK format sang StoredMessage để lưu */
export function messagesToStored(msgs: any[]): StoredMessage[] {
  return msgs
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.parts
        ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
        : (m.content || ''),
      createdAt:
        m.createdAt instanceof Date
          ? m.createdAt.toISOString()
          : (m.createdAt || new Date().toISOString()),
    }));
}

/** Chuyển StoredMessage trở lại format AI SDK để load vào useChat */
export function storedToMessages(stored: StoredMessage[]): any[] {
  return stored.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    parts: [{ type: 'text', text: m.content }],
    createdAt: new Date(m.createdAt),
  }));
}

export function useChatHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load conversations từ API khi mount
  useEffect(() => {
    fetch('/api/conversations')
      .then((r) => r.json())
      .then((data: Conversation[]) => {
        setConversations(Array.isArray(data) ? data : []);
      })
      .catch(() => setConversations([]))
      .finally(() => setHydrated(true));
  }, []);

  const createConversation = useCallback(
    (firstMessage?: string): Conversation => {
      const id = crypto.randomUUID();
      const title = firstMessage
        ? firstMessage.slice(0, 45) + (firstMessage.length > 45 ? '...' : '')
        : 'Cuộc trò chuyện mới';

      const newConv: Conversation = {
        id,
        title,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Cập nhật UI ngay (optimistic update)
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(id);

      // Lưu vào DB (fire and forget)
      fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title }),
      }).catch((err) => console.error('[createConversation]', err));

      return newConv;
    },
    []
  );

  const updateConversation = useCallback(
    (convId: string, messages: StoredMessage[]) => {
      // Cập nhật UI ngay (optimistic update)
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const firstUser = messages.find((m) => m.role === 'user');
          const title =
            c.title === 'Cuộc trò chuyện mới' && firstUser
              ? firstUser.content.slice(0, 45) + (firstUser.content.length > 45 ? '...' : '')
              : c.title;
          return { ...c, title, messages, updatedAt: new Date().toISOString() };
        })
      );

      // Lưu vào DB (fire and forget)
      fetch(`/api/conversations/${convId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      }).catch((err) => console.error('[updateConversation]', err));
    },
    []
  );

  const deleteConversation = useCallback(
    (convId: string) => {
      // Cập nhật UI ngay (optimistic update)
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      setActiveId((prev) => (prev === convId ? null : prev));

      // Xoá trong DB (fire and forget)
      fetch(`/api/conversations/${convId}`, { method: 'DELETE' }).catch((err) =>
        console.error('[deleteConversation]', err)
      );
    },
    []
  );

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  return {
    hydrated,
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    updateConversation,
    deleteConversation,
  };
}
