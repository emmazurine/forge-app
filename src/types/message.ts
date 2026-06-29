import { PortfolioSnapshot } from './portfolio';

export interface Message {
  id: string;
  senderId: 'me' | string;
  text: string;
  sentAt: number;
  type?: 'text' | 'portfolio';
  portfolio?: PortfolioSnapshot;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantInitials: string;
  participantAvatarColor: string;
  participantSchool: string;
  messages: Message[];
  updatedAt: number;
}
