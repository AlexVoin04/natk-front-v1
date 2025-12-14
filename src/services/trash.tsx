import api from "./api";
import type { AxiosResponse } from "axios";

export interface TrashItemDto {
  id: string;
  name: string;
  type: string; // "folder" или mime-type
  deletedAt: string;
  path: string;
  parentFolder: string | null;
}

export async function fetchTrashItems(): Promise<TrashItemDto[]> {
  const resp: AxiosResponse<TrashItemDto[]> = await api.get("/storage/bin");
  return resp.data;
}

export async function restoreTrashItem(
  item: TrashItemDto,
  targetFolderId: string | null
): Promise<void> {
  if (item.type === "folder") {
    await api.put(`/storage/folders/${item.id}/restore`, null, {
      params: { targetParentFolderId: targetFolderId ?? undefined }
    });
  } else {
    await api.put(`/storage/files/${item.id}/restore`, null, {
      params: { targetFolderId: targetFolderId ?? undefined }
    });
  }
}