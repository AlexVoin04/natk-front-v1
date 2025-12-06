import api from "./api";
import type { FolderTreeDto } from "./interfaces";

export async function fetchFolderTree(): Promise<FolderTreeDto[]> {
  const resp = await api.get<FolderTreeDto[]>("/storage/folders/tree");
  return resp.data;
}

export type FolderContentResponseDto = {
  folderId: string | null;
  path: string;
  items: Array<{
    id: string;
    name: string;
    type: string; // "folder" or mime-type
    createdAt: string;
    updatedAt: string | null;
  }>;
  /**
   * надо фиксить бэкенд для крошек:
   * pathIds: string[]; // ['all', 'id1', 'id2']
   * pathNames: string[]; // ['Все файлы', 'Папка1', 'Папка2']
   */
};

/**
 * Получить содержимое папки. Если folderId === null | undefined — корень.
 */
export async function fetchFolderItems(folderId?: string | null): Promise<FolderContentResponseDto> {
  const params = folderId ? { folderId } : {};
  const resp = await api.get<FolderContentResponseDto>("/storage/items", { params });
  return resp.data;
}