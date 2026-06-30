export type ExperienceType =
  | 'hackathon'
  | 'research'
  | 'startup'
  | 'internship'
  | 'club'
  | 'project'
  | 'other';

export interface ProofLink {
  label: string;
  url: string;
}

export interface Experience {
  id: string;
  title: string;
  role: string;
  type: ExperienceType;
  description: string;
  outcome?: string;
  lessonsLearned?: string;
  skills: string[];
  startDate: string;
  endDate?: string;
  link?: string;
  proofLinks?: ProofLink[];
}

export type ProjectUpdateTag = 'progress' | 'stuck' | 'milestone' | 'shipped';

export interface ProjectUpdate {
  id: string;
  text: string;
  timestamp: number;
  tag: ProjectUpdateTag;
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
