import api from "./api";
import type { FolderTreeDto } from "./interfaces";

export async function fetchFolderTree(): Promise<FolderTreeDto[]> {
  const resp = await api.get<FolderTreeDto[]>("/storage/folders/tree");
  return resp.data;
}