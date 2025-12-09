export interface Workspace {
  id: string;
  name: string;
  icon: string; // Emoji or icon name
  createdAt: number;
  updatedAt: number;
  order: number;
}

export interface CreateWorkspaceInput {
  name: string;
  icon?: string;
}
