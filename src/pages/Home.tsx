import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import ActionBar from '../components/ActionBar';
import FileTable from '../components/FileTable';
import CreateFolderDialog from '../components/CreateFolderDialog';
import UploadDialog from '../components/UploadDialog';
import RenameDialog from "../components/RenameDialog";
import CopyFileDialog from '../components/CopyFileDialog';
import FilePropertiesDialog from '../components/FilePropertiesDialog';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { fetchFolderItems, downloadFile, createFolder, fetchFileInfo, deleteFile, deleteFolder, renameFile, renameFolder, copyFile, moveFile, moveFolder, bulkDelete } from '../services/storage';
import { resolveFileIcon } from "../components/FileTable";
import { type FileItem } from '../services/interfaces';
import { useParams, useNavigate } from "react-router-dom";
import FileViewer from '../components/FileViewer';
import type { PurgeItemDto, BulkDeleteResult } from '../services/interfaces'

  const mapItems = (items: any[]): FileItem[] =>
    items.map(it => ({
      id: it.id,
      name: it.name,
      type: it.type === 'folder' ? 'folder' : 'file',
      fileType: it.type === 'folder' ? undefined : it.type,
      size: it.size,
      antivirusStatus: it.fileAntivirusStatus,
      createdAt: it.createdAt,
      updatedAt: it.updatedAt
    }));

const Home: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState<{ name: string; id: string | null }[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('Все файлы');
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'createdAt'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [selectedFileInfo, setSelectedFileInfo] = useState<any | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; type: "file" | "folder"; name: string } | null>(null);
  const [renameSuggested, setRenameSuggested] = useState<string | null>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyFileId, setCopyFileId] = useState<string | null>(null);
  const [createFolderParent, setCreateFolderParent] = useState<string | null>(null);  // null = root ("Все файлы")
  const [createFolderParentName, setCreateFolderParentName] = useState("Все файлы");
  const [folderTreeVersion, setFolderTreeVersion] = useState(0);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveItem, setMoveItem] = useState<{ id: string; type: "file" | "folder"; name: string } | null>(null);
  const [viewFileId, setViewFileId] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedFilesCount = selectedIds.filter(id => files.find(f => f.id === id)?.type === 'file').length;
  const selectedFoldersCount = selectedIds.filter(id => files.find(f => f.id === id)?.type === 'folder').length;

  const { folderId } = useParams();
  const navigate = useNavigate();

  const currentFolderId = folderId ?? null;



  // При смене папки — загружаем её содержимое
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetchFolderItems(currentFolderId);
        setCurrentPath(resp.path || 'Все файлы');

        const mapped = mapItems(resp.items);
        setFiles(mapped);

        setBreadcrumbItems(
        resp.pathIds.map((id, index) => ({
          name: resp.pathNames[index],
          id: id 
        }))
      );
      } catch (e) {
        console.error("Failed to load folder items", e);
        toast.error("Failed to load folder contents");
      } finally {
        setLoading(false);
      }
    };

    setSelectedIds([]);//сброс выбранных элементов
    load();
  }, [currentFolderId]);

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      navigate(`/folder/${item.id}`);
    } else {
      handleOpenFileViewer(item.id);
    }
  };

  const handleOpenProperties = async (fileId: string) => {
    try {
      const item = files.find(f => f.id === fileId);

      if (!item) return;

      if (item.type === "folder") {
        // просто выходим, ничего не делаем
        return;
      }


      fetchFileInfo(fileId)
        .then(info => {
          setSelectedFileInfo({...info, icon: item ? resolveFileIcon(item) : null});
          setIsPropertiesOpen(true);
        });
    } catch (e) {
      toast.error("Не удалось получить свойства файла");
    }
  };

  const handleDeleteItem = async (id: string, type: "file" | "folder") => {
    try {
      if (type === "folder") {
        await deleteFolder(id);
      } else {
        await deleteFile(id);
      }

      const updated = await fetchFolderItems(currentFolderId);
      setFiles(mapItems(updated.items));

    } catch (e) {
      toast.error("Не удалось удалить элемент");
    }
  }

  const handleCreateFolder = async (name: string) => {
    try {
      const newFolder = await createFolder(currentFolderId, name);

      toast.success(`Папка "${name}" создана`);

      // Обновляем контент текущей директории
      const resp = await fetchFolderItems(currentFolderId);
      setFiles(mapItems(resp.items));
      // Обновляем путь
      setCurrentPath(resp.path || 'Все файлы');

      setIsCreateFolderOpen(false);

    } catch (e: any) {
      if (e.message) {
        toast.error(e.message);
          return {
          error: e.message,
          suggestedName: (e as any).suggestedName
        };
      }

      toast.error("Ошибка при создании папки");
    }
  };

  const handleUploadFiles = async (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 0) return;

    try {
      const resp = await fetchFolderItems(currentFolderId);
      setFiles(mapItems(resp.items));
    } catch (e) {
      toast.error("Unexpected error while uploading");
      console.error(e);
    }
  };

    // прокидываем в сайдбар — при клике на папку будет устанавливаться currentFolderId
  const handleFolderClick = (folderId: string | null) => {
    if (folderId === null) {
      navigate("/");
    } else {
      navigate(`/folder/${folderId}`);
    }
  };

  const sortItems = (items: FileItem[]) => {
    return [...items].sort((a, b) => {
      // 1. Сначала сортировка по типу — папки выше
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      // 2. Сортировка по имени
      if (sortField === 'name') {
        const cmp = a.name.localeCompare(b.name);
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      // 3. Сортировка по creation date
      if (sortField === 'createdAt') {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        const cmp = da - db;

        return sortDirection === 'asc' ? cmp : -cmp;
      }

      return 0;
    });
  };

  const handleOpenRename = (item: { id: string; type: "folder" | "file"; name?: string } | null) => {
    if (!item) return;
    setRenameSuggested(null);
    setRenameTarget({ id: item.id, type: item.type as "file" | "folder", name: item.name ?? "" });
  };

  const handleConfirmRename = async (newName: string) => {
    if (!renameTarget) return;

    try {
      if (renameTarget.type === "file") {
        const resp = await renameFile(renameTarget.id, newName);
        toast.success(`Файл переименован в "${resp.name}"`);
      } else {
        const resp = await renameFolder(renameTarget.id, newName);
        toast.success(`Папка переименована в "${resp.name}"`);
      }

      // обновляем текущую директорию
      const updated = await fetchFolderItems(currentFolderId);
      setFiles(mapItems(updated.items));

      // Закрываем диалог
      setRenameTarget(null);
      setRenameSuggested(null);
    } catch (e: any) {
      // если сервер вернул suggestedName — передаём его в диалог
      if ((e as any).suggestedName) {
        setRenameSuggested((e as any).suggestedName);
        // выбрасываем дальше, чтобы RenameDialog показал сообщение
        throw e;
      }
      // иначе просто пробросим сообщение
      throw e;
    }
  };

  const handleCopyRequest = (fileId: string) => {
    setCopyFileId(fileId);
    setCopyDialogOpen(true);
  };

  const handleConfirmCopy = async (targetFolderId: string | null) => {
    if (!copyFileId) return;

    const resp = await copyFile(copyFileId, targetFolderId);
    toast.success(`Скопировано как "${resp.name}"`);

    const updated = await fetchFolderItems(currentFolderId);
    setFiles(mapItems(updated.items));

    setCopyDialogOpen(false);
    setCopyFileId(null);
  };

  const handleCreateFolderInCopy = (parentId: string | null, parentName: string) => {
    setCreateFolderParent(parentId);
    setCreateFolderParentName(parentName);
    setIsCreateFolderOpen(true);
  };

  const handleCreateFolderConfirm = async (name: string) => {
    try {
      await createFolder(createFolderParent, name);

      toast.success(`Папка "${name}" создана`);

      setFolderTreeVersion(v => v + 1);

      const resp = await fetchFolderItems(currentFolderId);
      setFiles(mapItems(resp.items));

      setIsCreateFolderOpen(false);
      setCreateFolderParent(null);

    } catch (e: any) {
      return {
        error: e.message || "Ошибка при создании папки",
        suggestedName: e.suggestedName
      };
    }
  };

  const handleConfirmMove = async (targetFolderId: string | null) => {
    if (!moveItem) return;

    try {
      if (moveItem.type === "file") {
        const resp = await moveFile(moveItem.id, targetFolderId);
        toast.success(`Файл "${resp.name}" перемещён`);
      } else {
        const resp = await moveFolder(moveItem.id, targetFolderId);
        toast.success(`Папка "${resp.name}" перемещена`);
      }

      const updated = await fetchFolderItems(currentFolderId);
      setFiles(mapItems(updated.items));

    } catch (e) {
      console.error("Move failed", e);
    } finally {
      setMoveDialogOpen(false);
      setMoveItem(null);
    }
  };

  const handleMoveRequest = (item: { id: string; type: "file" | "folder"; name: string }) => {
    setMoveItem(item);
    setMoveDialogOpen(true);
  };

  const handleOpenFileViewer = (fileId: string) => {
    setViewFileId(fileId);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const items: PurgeItemDto[] = selectedIds.map(id => {
      const it = files.find(f => f.id === id);
      return {
        id,
        type: it?.type === 'folder' ? 'FOLDER' : 'FILE'
      };
    });

    try {
      const result: BulkDeleteResult = await bulkDelete(items);

      if (result.failed && Object.keys(result.failed).length > 0) {
        const failCount = Object.keys(result.failed).length;
        const successCount = result.success?.length ?? 0;
        toast.warn(`Удалено: ${successCount}. Не удалено: ${failCount}.`);
      } else {
        toast.success(`Удалено: ${result.success?.length ?? selectedIds.length}`);
      }

      const updated = await fetchFolderItems(currentFolderId);
      setFiles(mapItems(updated.items));

      setSelectedIds([]);
    } catch (e) {
      toast.error("Ошибка при пакетном удалении");
      console.error(e);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onFolderClick={handleFolderClick} 
          refreshTrigger={files.length}
        />
        
        <main className="flex-1 p-6 flex flex-col overflow-hidden">
          <Breadcrumbs
            items={breadcrumbItems}
            onClick={(id) => {
              if (id === null) navigate("/");
              else navigate(`/folder/${id}`);
            }}
          />
          
          <ActionBar
            onUploadFile={() => setIsUploadOpen(true)}
            onCreateFolder={() => {
              setCreateFolderParent(currentFolderId);

              const currentName =
              currentFolderId === null
                ? "Все файлы"
                : (currentPath ? currentPath.split("/").filter(Boolean).pop() : "Папка") || "Папка";

              setCreateFolderParentName(currentName);
              setIsCreateFolderOpen(true);
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}

            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={(field, dir) => {
              setSortField(field);
              setSortDirection(dir);
            }}
            selectedFilesCount={selectedFilesCount}
            selectedFoldersCount={selectedFoldersCount}
            onDeleteSelected={handleDeleteSelected}
            onClearSelection={() => setSelectedIds([])}
          />

          <div className="flex flex-col flex-1 mt-4 overflow-hidden">
            {loading ? (
              <div className="p-6">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <FileTable
                items={sortItems(files)}
                viewMode={viewMode}
                onItemDoubleClick={handleItemDoubleClick}
                onDownloadFile={(id) => downloadFile(id)}
                onOpenProperties={handleOpenProperties}
                onDeleteItem={handleDeleteItem}
                onRename={(item) => handleOpenRename(item)}
                onMove={(item) => handleMoveRequest(item)}
                // onCopy={(id) => handleCopyItem(id)}
                onCopy={(id) => handleCopyRequest(id)}
                onSortChange={(field, dir) => {
                  setSortField(field);
                  setSortDirection(dir);
                }}
                sortField={sortField}
                sortDirection={sortDirection}
                onCreateFolder={() => {
                  const currentName = currentFolderId === null
                    ? "Все файлы"
                    : (currentPath ? currentPath.split("/").filter(Boolean).pop() : "Папка") || "Папка";
                  setCreateFolderParent(currentFolderId);
                  setCreateFolderParentName(currentName);
                  setIsCreateFolderOpen(true);
                }}
                onUploadFile={() => setIsUploadOpen(true)}
                selectedIds={selectedIds}
                onSelectionChange={(ids) => setSelectedIds(ids)}
              />
            )}
          </div>
        </main>
      </div>

      <Footer />

      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadFiles}
        folderId={currentFolderId}
      />

      <FilePropertiesDialog
        isOpen={isPropertiesOpen}
        onClose={() => setIsPropertiesOpen(false)}
        file={selectedFileInfo}
      />

      <RenameDialog
        isOpen={!!renameTarget}
        onClose={() => { setRenameTarget(null); setRenameSuggested(null);}}
        currentName={renameTarget?.name ?? ""}
        onConfirm={handleConfirmRename}
        suggestedName={renameSuggested}
      />

      <CopyFileDialog
        isOpen={copyDialogOpen}
        onClose={() => setCopyDialogOpen(false)}
        onConfirm={handleConfirmCopy}
        onCreateFolder={handleCreateFolderInCopy}
        treeVersion={folderTreeVersion}
        mode="copy"
      />

      <CopyFileDialog
        isOpen={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        onConfirm={handleConfirmMove}
        onCreateFolder={handleCreateFolderInCopy}
        treeVersion={folderTreeVersion}
        mode="move"
      />

      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        parentId={createFolderParent}
        parentName={createFolderParentName}
        onClose={() => {
          setIsCreateFolderOpen(false);
          setCreateFolderParent(null);
          setCreateFolderParentName("Все файлы");
        }}
        onConfirm={handleCreateFolderConfirm}
      />

      {viewFileId && (
        <FileViewer
          fileId={viewFileId}
          onClose={() => setViewFileId(null)}
        />
      )}
    </div>
  );
};

export default Home;