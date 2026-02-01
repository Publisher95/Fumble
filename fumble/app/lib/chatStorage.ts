// Utility for managing chat metadata in localStorage

interface ChatMetadata {
  lastMessageTime: number;
}

export function updateChatLastMessage(chatId: number): void {
  if (typeof window === 'undefined') return;

  const key = `chat_${chatId}_metadata`;
  const metadata: ChatMetadata = {
    lastMessageTime: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(metadata));
}

export function getChatLastMessageTime(chatId: number): number {
  if (typeof window === 'undefined') return 0;

  const key = `chat_${chatId}_metadata`;
  const data = localStorage.getItem(key);
  if (!data) return 0;

  try {
    const metadata: ChatMetadata = JSON.parse(data);
    return metadata.lastMessageTime;
  } catch {
    return 0;
  }
}
