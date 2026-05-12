"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentId, Conversation, Language, ChatMessage, Citation } from "./types";
import { DEFAULT_AGENT_ID } from "./agents";

export type ThemeMode = "dark" | "light" | "system";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function summarize(text: string, max = 56) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

export interface Bookmark {
  paragraphId: string;
  bookSlug: string;
  bookTitle: string;
  excerpt: string;
  chapterTitle: string;
  addedAt: number;
}

interface HubState {
  language: Language;
  theme: ThemeMode;
  activeAgentId: AgentId;
  conversations: Record<string, Conversation>;
  bookmarks: Record<string, Bookmark>;
  activeId: string | null;
  hydrated: boolean;
}

interface HubActions {
  setLanguage: (lang: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
  setActiveAgent: (id: AgentId) => void;
  newConversation: (agentId?: AgentId) => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  appendUserMessage: (text: string) => { conversationId: string; messageId: string } | null;
  appendAssistantPlaceholder: () => { conversationId: string; messageId: string } | null;
  patchAssistantMessage: (
    conversationId: string,
    messageId: string,
    patch: { append?: string; citations?: Citation[] },
  ) => void;
  prepareRegenerate: () => { conversationId: string; lastUserText: string } | null;
  renameConversation: (id: string, title: string) => void;
  toggleBookmark: (b: Bookmark) => boolean;
  removeBookmark: (paragraphId: string) => void;
  markHydrated: () => void;
}

export const useHubStore = create<HubState & HubActions>()(
  persist(
    (set, get) => ({
      language: "he",
      theme: "dark",
      activeAgentId: DEFAULT_AGENT_ID,
      conversations: {},
      bookmarks: {},
      activeId: null,
      hydrated: false,

      markHydrated: () => set({ hydrated: true }),

      setLanguage: (language) => set({ language }),

      setTheme: (theme) => set({ theme }),

      cycleTheme: () => {
        const order: ThemeMode[] = ["dark", "light", "system"];
        const i = order.indexOf(get().theme);
        const next = order[(i + 1) % order.length];
        set({ theme: next });
      },

      setActiveAgent: (id) => {
        set({ activeAgentId: id });
        const { activeId, conversations } = get();
        if (activeId && conversations[activeId]) {
          set({
            conversations: {
              ...conversations,
              [activeId]: { ...conversations[activeId], agentId: id, updatedAt: Date.now() },
            },
          });
        }
      },

      newConversation: (agentId) => {
        const id = uid();
        const now = Date.now();
        const ag = agentId ?? get().activeAgentId;
        const c: Conversation = {
          id,
          agentId: ag,
          title: get().language === "he" ? "שיחה חדשה" : "New conversation",
          createdAt: now,
          updatedAt: now,
          messages: [],
        };
        set((s) => ({
          conversations: { ...s.conversations, [id]: c },
          activeId: id,
          activeAgentId: ag,
        }));
        return id;
      },

      selectConversation: (id) => {
        const c = get().conversations[id];
        if (!c) return;
        set({ activeId: id, activeAgentId: c.agentId });
      },

      deleteConversation: (id) => {
        const { conversations, activeId } = get();
        const next = { ...conversations };
        delete next[id];
        set({
          conversations: next,
          activeId: activeId === id ? null : activeId,
        });
      },

      appendUserMessage: (text) => {
        let { activeId } = get();
        if (!activeId) {
          activeId = get().newConversation();
        }
        const conv = get().conversations[activeId!];
        if (!conv) return null;
        const msg: ChatMessage = {
          id: uid(),
          role: "user",
          content: text,
          createdAt: Date.now(),
        };
        const isFirst = conv.messages.length === 0;
        const next: Conversation = {
          ...conv,
          messages: [...conv.messages, msg],
          updatedAt: Date.now(),
          title: isFirst ? summarize(text) : conv.title,
        };
        set((s) => ({ conversations: { ...s.conversations, [next.id]: next } }));
        return { conversationId: next.id, messageId: msg.id };
      },

      appendAssistantPlaceholder: () => {
        const { activeId } = get();
        if (!activeId) return null;
        const conv = get().conversations[activeId];
        if (!conv) return null;
        const msg: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: "",
          createdAt: Date.now(),
        };
        const next: Conversation = {
          ...conv,
          messages: [...conv.messages, msg],
          updatedAt: Date.now(),
        };
        set((s) => ({ conversations: { ...s.conversations, [next.id]: next } }));
        return { conversationId: next.id, messageId: msg.id };
      },

      patchAssistantMessage: (conversationId, messageId, patch) => {
        const conv = get().conversations[conversationId];
        if (!conv) return;
        const messages = conv.messages.map((m) => {
          if (m.id !== messageId) return m;
          return {
            ...m,
            content: patch.append ? m.content + patch.append : m.content,
            citations: patch.citations ?? m.citations,
          };
        });
        set((s) => ({
          conversations: {
            ...s.conversations,
            [conversationId]: { ...conv, messages, updatedAt: Date.now() },
          },
        }));
      },

      prepareRegenerate: () => {
        const { activeId } = get();
        if (!activeId) return null;
        const conv = get().conversations[activeId];
        if (!conv) return null;

        // Walk from the end. Drop trailing assistant messages until we find
        // a user message; return its text so the caller can re-stream.
        const msgs = [...conv.messages];
        while (msgs.length > 0 && msgs[msgs.length - 1].role === "assistant") {
          msgs.pop();
        }
        const lastUser = [...msgs].reverse().find((m) => m.role === "user");
        if (!lastUser) return null;

        set((s) => ({
          conversations: {
            ...s.conversations,
            [conv.id]: { ...conv, messages: msgs, updatedAt: Date.now() },
          },
        }));
        return { conversationId: conv.id, lastUserText: lastUser.content };
      },

      toggleBookmark: (b) => {
        const exists = !!get().bookmarks[b.paragraphId];
        set((s) => {
          const next = { ...s.bookmarks };
          if (exists) delete next[b.paragraphId];
          else next[b.paragraphId] = b;
          return { bookmarks: next };
        });
        return !exists;
      },

      removeBookmark: (paragraphId) => {
        set((s) => {
          const next = { ...s.bookmarks };
          delete next[paragraphId];
          return { bookmarks: next };
        });
      },

      renameConversation: (id, title) => {
        const conv = get().conversations[id];
        if (!conv) return;
        set((s) => ({
          conversations: { ...s.conversations, [id]: { ...conv, title, updatedAt: Date.now() } },
        }));
      },
    }),
    {
      name: "sap-ai-hub-store",
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        activeAgentId: state.activeAgentId,
        conversations: state.conversations,
        bookmarks: state.bookmarks,
        activeId: state.activeId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

export function getConversationsList(state: HubState): Conversation[] {
  return Object.values(state.conversations).sort((a, b) => b.updatedAt - a.updatedAt);
}
