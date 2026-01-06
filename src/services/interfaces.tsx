export interface UserProfile {
  id: string;
  login: string;
  name: string;
  surname: string;
  patronymic: string | null;
  phoneNumber: string | null;
  roles: string[];
  joinDate: string;        // временно
  storageUsed: number;
  storageLimit: number;
}

export interface FolderTreeDto {
  id: string;
  name: string;
  depth: number;
  children: FolderTreeDto[];
}

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: string;
  size?: number | null;
  antivirusStatus?: 
    | "UPLOADED_PENDING_SCAN"
    | "SCANNING"
    | "READY"
    | "INFECTED"
    | "ERROR";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PurgeItemDto {
  id: string;
  type: "FILE" | "FOLDER";
}

export interface BulkDeleteResult {
  success: string[]; // uuid strings
  failed: { [id: string]: string };
}