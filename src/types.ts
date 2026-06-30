export interface Message {
  id: string;
  recipientUsername: string;
  text: string;
  createdAt: string;
}

export interface UserSession {
  username: string;
  token: string;
}

export type ViewType = "home" | "login" | "signup" | "dashboard" | "send";
