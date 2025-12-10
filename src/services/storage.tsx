import api from "./api";
import type { FolderTreeDto } from "./interfaces";
import { toast } from "react-toastify";
import type { AxiosRequestConfig } from 'axios';

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

export async function createFolder(parentFolderId: string | null, name: string) {
  try {
    const resp = await api.post("/storage/folders", {
      parentFolderId,
      name
    });

    return resp.data;
  } catch (e: any) {
    // сервер вернул JSON с ошибкой
    if (e.response?.data?.error) {
      const err = new Error(e.response.data.error);
      (err as any).suggestedName = e.response.data.suggestedName;
      throw err;
    }

    throw new Error("Unknown error while creating folder");
  }
}

export async function downloadFile(fileId: string): Promise<void> {
  const resp = await api.get(`/storage/files/${fileId}/download`, {
    responseType: "blob", 
    validateStatus: () => true
  });

  // --- Проверяем, не ошибка ли это ---
  const contentType = resp.headers["content-type"];
  // если сервер вернул ошибку с JSON внутри blob
  if (resp.status >= 400) {
    if (contentType?.includes("application/json")) {
      const text = await resp.data.text();
      const json = JSON.parse(text);
      toast.error(json.message || "Ошибка скачивания файла");
    } else {
      toast.error(`Ошибка скачивания файла (${resp.status})`);
    }
    return;
  }

  // --- OK: скачиваем файл ---

  const blob = new Blob([resp.data]);
  const url = window.URL.createObjectURL(blob);

  // достаём имя файла из заголовков
  let filename = "file";

const disposition = resp.headers["content-disposition"];
if (disposition) {
  // 1. filename*=UTF-8''имя.ext
  let utf8name = disposition.match(/filename\*=\s*UTF-8''(.+?)(;|$)/);
  if (utf8name) {
    filename = decodeURIComponent(utf8name[1]);
  } else {
    // 2. filename="имя.ext"
    let quoted = disposition.match(/filename="(.+?)"/);
    if (quoted) {
      filename = quoted[1];
    }
  }
}

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function uploadFileRequest(
  file: File,
  name: string,
  folderId: string | null,
  onProgress?: (percent: number) => void
) {
  const formData = new FormData();
  formData.append("name", name);
  if (folderId) formData.append("folderId", folderId);
  formData.append("fileData", file);

  const config: AxiosRequestConfig = {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  };

  try {
    const resp = await api.post("/storage/files", formData, config);
    const data = await resp.data;
    if (data.error) {
      const err = new Error(data.error);
      (err as any).suggestedName = data.suggestedName;
      throw err;
    }
    return data;
  } catch (e: any) {
    if (e.response?.data) {
      const err = new Error(e.response.data.error || "Upload failed");
      (err as any).suggestedName = e.response.data.suggestedName;
      throw err;
    }
    throw e;
  }
}

export async function fetchFileInfo(fileId: string) {
  const resp = await api.get(`/storage/files/${fileId}`);
  return resp.data;
}