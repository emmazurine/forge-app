export type EventType = 'lock-in' | 'hackathon' | 'workshop' | 'study-group' | 'social' | 'other';

export interface EventSponsor {
  name: string;
  role: string;    // e.g. "CS Teacher", "Faculty Advisor", "Parent Volunteer"
  email: string;
}

export interface ForgeEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  hostId: string;
  hostName: string;
  hostInitials: string;
  hostAvatarColor: string;
  location: string;
  spotId?: string;
  date: string;       // 'YYYY-MM-DD'
  startTime: string;  // '7:00 PM'
  endTime?: string;   // '7:00 AM' next day
  capacity: number;
  rsvpIds: string[];  // user ids who rsvped
  tags: string[];
  isPast: boolean;
  sponsors: EventSponsor[];
}
