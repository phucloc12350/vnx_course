'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation, StoredMessage } from '@/types/chat';

const STORAGE_KEY = 'vnx-co-minh-conversations';

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: Conversation[] = raw ? JSON.parse(raw) : [];
      setConversations(parsed);
    } catch {
      setConversations([]);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((convs: Conversation[]) => {
    setConversations(convs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  }, []);

  const createConversation = useCallback(
    (firstMessage?: string): Conversation => {
      const title = firstMessage
        ? firstMessage.slice(0, 45) + (firstMessage.length > 45 ? '...' : '')
        : 'Cuộc trò chuyện mới';
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        title,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newConv, ...conversations];
      persist(updated);
      setActiveId(newConv.id);
      return newConv;
    },
    [conversations, persist]
  );

  const updateConversation = useCallback(
    (convId: string, messages: StoredMessage[]) => {
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== convId) return c;
          const firstUser = messages.find((m) => m.role === 'user');
          const title =
            c.title === 'Cuộc trò chuyện mới' && firstUser
              ? firstUser.content.slice(0, 45) + (firstUser.content.length > 45 ? '...' : '')
              : c.title;
          return { ...c, title, messages, updatedAt: new Date().toISOString() };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const deleteConversation = useCallback(
    (convId: string) => {
      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== convId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      setActiveId((prev) => {
        if (prev !== convId) return prev;
        const remaining = conversations.filter((c) => c.id !== convId);
        return remaining[0]?.id ?? null;
      });
    },
    [conversations]
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
