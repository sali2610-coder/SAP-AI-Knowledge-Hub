export type AgentId =
  | "pp"
  | "abap-s4"
  | "tosca"
  | "architect"
  | "pm"
  | "qm"
  | "wm"
  | "mm";

export type Language = "he" | "en";

export type Role = "user" | "assistant" | "system";

export interface Citation {
  bookSlug: string;
  bookTitle: string;
  chapter?: string;
  page?: number;
  paragraphId?: string;
  chunkIndex?: number;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  citations?: Citation[];
}

export interface Conversation {
  id: string;
  agentId: AgentId;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface AgentCopy {
  name: string;
  tagline: string;
  description: string;
  examples: string[];
}

export interface Agent {
  id: AgentId;
  accent: string;
  icon: string;
  primary: boolean;
  bookSlugs: string[];
  he: AgentCopy;
  en: AgentCopy;
  systemPromptHint: {
    he: string;
    en: string;
  };
}

export interface BookEntry {
  slug: string;
  title: string;
  file: string;
  module: string;
  agents: string[];
  pageCount: number;
  chapters: { n: number; title: string }[];
  terms: string[];
  tcodes: string[];
  tables: string[];
  error?: string;
}

export interface KbIndex {
  generatedAt: string;
  books: BookEntry[];
}
