type ChatMessageLite = {
  senderId: number | null;
  createdAt: string;
};

const READ_KEY_PREFIX = "estatepro:chat:lastRead:";

const getStorageKey = (userId: number | string) => `${READ_KEY_PREFIX}${userId}`;

export const getChatReadMap = (userId: number | string): Record<string, string> => {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const setConversationReadAt = (
  userId: number | string,
  conversationId: number | string,
  readAt: string,
) => {
  if (typeof window === "undefined") return;

  const map = getChatReadMap(userId);
  map[String(conversationId)] = readAt;
  localStorage.setItem(getStorageKey(userId), JSON.stringify(map));
};

export const getConversationReadAt = (
  userId: number | string,
  conversationId: number | string,
) => {
  const map = getChatReadMap(userId);
  return map[String(conversationId)];
};

export const countUnreadMessages = (
  messages: ChatMessageLite[],
  currentUserId: number,
  lastReadAt?: string,
) => {
  const lastReadTime = lastReadAt ? new Date(lastReadAt).getTime() : 0;

  return messages.reduce((count, msg) => {
    const createdAtTime = new Date(msg.createdAt).getTime();
    if (Number.isNaN(createdAtTime)) return count;

    const isIncoming = msg.senderId !== currentUserId;
    if (isIncoming && createdAtTime > lastReadTime) {
      return count + 1;
    }
    return count;
  }, 0);
};

