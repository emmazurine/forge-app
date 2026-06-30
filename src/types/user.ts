export interface Student {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  school: string;
  major: string;
  year: string;
  bio: string;
  interests: string[];
  skills: string[];
  currentProject?: string;
  projectDescription?: string;
  projectStage?: string;
  openToCollaborate: boolean;
  distance?: string;
  graduationYear?: string;
  verified?: boolean;
  isAmbassador?: boolean;
}
