import api from "./api";
import type { AxiosResponse } from "axios";
import type { PurgeItemDto } from "./interfaces";

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

export async function purgeTrashItem(item: TrashItemDto): Promise<void> {
  if (item.type === "folder") {
    await api.delete(`/storage/bin/folders/${item.id}/purge`);
  } else {
    await api.delete(`/storage/bin/files/${item.id}/purge`);
  }
}

export function toPurgeItem(item: TrashItemDto): PurgeItemDto {
  return {
    id: item.id,
    type: item.type === "folder" ? "FOLDER" : "FILE"
  };
}

/** Батч purge (работает и для одного элемента) */
export async function purgeTrashBatch(items: TrashItemDto[]): Promise<void> {
  if (items.length === 0) return;

  const body = items.map(toPurgeItem);

  await api.delete("/storage/bin/purge", {
    data: body
  });
}