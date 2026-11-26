export interface CollaboratorItem {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface ProjectOwnerItem {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export interface CollaboratorsApiResponse {
  isOwner: boolean;
  owner: ProjectOwnerItem | null;
  collaborators: CollaboratorItem[];
}
