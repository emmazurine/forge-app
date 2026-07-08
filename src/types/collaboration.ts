export type CollabType = 'hackathon' | 'research' | 'startup' | 'club' | 'competition' | 'nonprofit' | 'other';
export type CollabVisibility = 'everyone' | 'school';

export interface CollabPost {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  userAvatarColor: string;
  userSchool: string;
  title: string;
  description: string;
  type: CollabType;
  skills: string[];
  interests: string[];
  postedAt: number;
  isOpen: boolean;
  applicantCount: number;
  visibility: CollabVisibility;
}
