import { ExperienceType } from './portfolio';

export interface ArchiveEntry {
  id: string;
  title: string;
  type: ExperienceType;
  description: string;
  outcome?: string;
  lessonsLearned?: string;
  skills: string[];
  school: string;
  graduationYear: number;
  teamMembers?: string[];
  startDate: string;
  endDate: string;
  link?: string;
  publishedAt: number;
  publisherId?: 'me' | string;
}
