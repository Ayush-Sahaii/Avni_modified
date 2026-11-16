export interface ForceSub {
  enabled: boolean;
  channelId: string;
  failOpen: boolean;
}

export const forceSubByChat = new Map<string, ForceSub>();
