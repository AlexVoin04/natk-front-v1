import api from "./api";
import type { FolderTreeDto } from "./interfaces";
import { toast } from "react-toastify";
import type { AxiosRequestConfig } from 'axios';
import { type FileItem } from '../services/interfaces';
import type { PurgeItemDto, BulkDeleteResult } from "./interfaces";

export async function fetchFolderTree(): Promise<FolderTreeDto[]> {
  const resp = await api.get<FolderTreeDto[]>("/storage/folders/tree");
  return resp.data;
}

export type FolderContentResponseDto = {
  folderId: string | null;
  path: string;
  pathIds: string[];
  pathNames: string[];
  items: Array<FileItem>;
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

export async function deleteFile(id: string) {
  try {
    await api.delete(`/storage/files/${id}`);
    toast.success("Файл удалён");
  } catch (e) {
    toast.error("Ошибка при удалении файла");
  }
}

export async function deleteFolder(id: string) {
  try {
    await api.delete(`/storage/folders/${id}`);
    toast.success("Папка удалена");
  } catch (e) {
    toast.error("Ошибка при удалении папки");
  }
}

export async function renameFile(id: string, newName: string) {
  try {
    const resp = await api.put(`/storage/files/${id}/rename`, { newName });
    return resp.data;
  } catch (e: any) {
    if (e.response?.data?.error) {
      const err = new Error(e.response.data.error);
      (err as any).suggestedName = e.response.data.suggestedName;
      throw err;
    }
    throw new Error("Unknown error while renaming file");
  }
}

export async function renameFolder(id: string, newName: string) {
  try {
    const resp = await api.put(`/storage/folders/${id}/rename`, { newName });
    return resp.data;
  } catch (e: any) {
    if (e.response?.data?.error) {
      const err = new Error(e.response.data.error);
      (err as any).suggestedName = e.response.data.suggestedName;
      throw err;
    }
    throw new Error("Unknown error while renaming folder");
  }
}

export async function copyFile(id: string, targetFolderId?: string | null) {
  try {
    // POST /storage/files/{id}/copy?targetFolderId=...
    const resp = await api.post(`/storage/files/${id}/copy`, null, {
      params: { targetFolderId: targetFolderId ?? null }
    });
    return resp.data;
  } catch (e: any) {
    const msg = e?.response?.data?.error || "Ошибка при копировании файла";
    toast.error(msg);
    throw e;
  }
}

export async function moveFile(id: string, targetFolderId: string | null) {
  try {
    const resp = await api.put(`/storage/files/${id}/move`, {
      newFolderId: targetFolderId,
      moveToRoot: targetFolderId === null
    });
    return resp.data;
  } catch (e: any) {
    const msg = e?.response?.data?.error || "Ошибка при перемещении файла";
    toast.error(msg);
    throw e;
  }
}

export async function moveFolder(id: string, targetFolderId: string | null) {
  try {
    const resp = await api.put(`/storage/folders/${id}/move`, {
      newParentFolderId: targetFolderId,
      moveToRoot: targetFolderId === null
    });
    return resp.data;
  } catch (e: any) {
    const msg = e?.response?.data?.error || "Ошибка при перемещении папки";
    toast.error(msg);
    throw e;
  }
}

export type FileForViewer = {
  objectUrl: string;
  fileName: string;
  contentType?: string;
};

/**
 * Загружает файл как blob через axios и возвращает object URL + имя файла.
 * Caller обязан вызвать URL.revokeObjectURL(objectUrl) при завершении.
 */
export async function fetchFileForViewer(fileId: string): Promise<FileForViewer> {
  const resp = await api.get(`/storage/files/${fileId}/download`, {
    responseType: "blob",
    validateStatus: () => true,
  });

  // --- Ошибка сервера (вернул JSON внутри blob) ---
  if (resp.status >= 400) {
    const contentType = resp.headers["content-type"] || resp.headers["Content-Type"];
    if (contentType?.includes("application/json")) {
      // прочитаем JSON из blob
      const text = await (resp.data as Blob).text();
      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch (e) {
        // ignore
      }
      throw new Error(json.message || `Ошибка открытия файла (${resp.status})`);
    } else {
      throw new Error(`Ошибка открытия файла (${resp.status})`);
    }
  }

  // создаём object URL ---
  const blob = resp.data as Blob;
  const objectUrl = URL.createObjectURL(blob);

  // достаём имя файла из заголовков
  let filename = "file";
  const disposition = resp.headers["content-disposition"] || resp.headers["Content-Disposition"];
  if (disposition) {
    // 1. filename*=UTF-8''имя.ext
    const utf8name = disposition.match(/filename\*=\s*UTF-8''(.+?)(;|$)/);
    if (utf8name) {
      filename = decodeURIComponent(utf8name[1]);
    } else {
      // 2. filename="имя.ext"
      const quoted = disposition.match(/filename="(.+?)"/);
      if (quoted) {
        filename = quoted[1];
      }
    }
  }

  const contentTypeHeader = resp.headers["content-type"] || resp.headers["Content-Type"];

  return {
    objectUrl,
    fileName: filename,
    contentType: contentTypeHeader,
  };
}

export async function bulkDelete(items: PurgeItemDto[]): Promise<BulkDeleteResult> {
  if (!items || items.length === 0) {
    return { success: [], failed: {} };
  }

  try {
    const resp = await api.delete<BulkDeleteResult>("/storage/items", { data: items });
    return resp.data;
  } catch (e: any) {
    // показываем ошибку и пробрасываем
    const msg = e?.response?.data?.message || "Ошибка пакетного удаления";
    toast.error(msg);
    throw e;
  }
}

export type StorageSearchScopeApi = 'BOTH' | 'FILES' | 'FOLDERS';

export async function searchItems(
  q: string,
  scope: StorageSearchScopeApi = 'BOTH'
) {
  const resp = await api.get('/storage/search', {
    params: {
      q,
      scope,
      // folderId заглушка
    },
  });

  return resp.data;
}