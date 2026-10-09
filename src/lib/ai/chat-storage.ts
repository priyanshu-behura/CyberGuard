/**
 * Client-Side Conversation Persistence & History Store
 * Manages active sessions, titles, multi-turn messages, and localStorage sync.
 */

import { AIConversation, AIMessage, AIAssistantMode } from "./types";

const STORAGE_KEY = "cyberguard_ai_conversations";
const ACTIVE_CONV_KEY = "cyberguard_ai_active_conv_id";

export class AIChatStorage {
  public static getConversations(): AIConversation[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static saveConversations(conversations: AIConversation[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error("Failed to save conversations to localStorage", e);
    }
  }

  public static getActiveConversationId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACTIVE_CONV_KEY);
  }

  public static setActiveConversationId(id: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACTIVE_CONV_KEY, id);
  }

  public static createNewConversation(
    initialMessage?: string,
    mode: AIAssistantMode = "cybersecurity"
  ): AIConversation {
    const defaultTitle =
      mode === "general" ? "General Conversation" : "Security Investigation";
    const title = initialMessage
      ? initialMessage.slice(0, 32).trim() + (initialMessage.length > 32 ? "..." : "")
      : defaultTitle;

    const newConv: AIConversation = {
      id: `conv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      title,
      mode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    const convs = this.getConversations();
    convs.unshift(newConv);
    this.saveConversations(convs);
    this.setActiveConversationId(newConv.id);
    return newConv;
  }

  public static appendMessage(conversationId: string, message: AIMessage): void {
    const convs = this.getConversations();
    const conv = convs.find((c) => c.id === conversationId);
    if (conv) {
      conv.messages.push(message);
      conv.updatedAt = new Date().toISOString();
      if (conv.title === "New Investigation" && message.role === "user") {
        conv.title = message.content.slice(0, 32).trim() + (message.content.length > 32 ? "..." : "");
      }
      this.saveConversations(convs);
    }
  }

  public static deleteConversation(conversationId: string): void {
    let convs = this.getConversations();
    convs = convs.filter((c) => c.id !== conversationId);
    this.saveConversations(convs);

    if (this.getActiveConversationId() === conversationId) {
      if (convs.length > 0) {
        this.setActiveConversationId(convs[0].id);
      } else {
        if (typeof window !== "undefined") {
          localStorage.removeItem(ACTIVE_CONV_KEY);
        }
      }
    }
  }

  public static clearAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_CONV_KEY);
  }
}
