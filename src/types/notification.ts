export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'message'
  | 'event_reminder'
  | 'post_interest'
  | 'welcome';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number;
  href?: string;
  avatarInitials?: string;
  avatarColor?: string;
}
