export type ExperienceType =
  | 'hackathon'
  | 'research'
  | 'startup'
  | 'internship'
  | 'club'
  | 'project'
  | 'other';

export interface Experience {
  id: string;
  title: string;
  role: string;
  type: ExperienceType;
  description: string;
  outcome?: string;
  lessonsLearned?: string;
  skills: string[];
  startDate: string;   // e.g. "Sep 2024"
  endDate?: string;    // e.g. "Nov 2024" — undefined means present
  link?: string;
}

export interface PortfolioSnapshot {
  senderName: string;
  senderSchool: string;
  senderMajor: string;
  senderInitials: string;
  senderAvatarColor: string;
  experiences: Experience[];
  sharedAt: number;
}
