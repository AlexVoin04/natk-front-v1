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