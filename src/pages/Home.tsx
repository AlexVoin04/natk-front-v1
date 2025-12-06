import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import ActionBar from '../components/ActionBar';
import FileTable from '../components/FileTable';
import CreateFolderDialog from '../components/CreateFolderDialog';
import UploadDialog from '../components/UploadDialog';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { fetchFolderItems } from '../services/storage';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: string;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
}

const Home: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState<{ name: string; id: string | null }[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // null = root ("Все файлы")
  const [currentPath, setCurrentPath] = useState<string>('Все файлы');
  const [loading, setLoading] = useState(false);

  // При смене папки — загружаем её содержимое
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetchFolderItems(currentFolderId);
        setCurrentPath(resp.path || 'Все файлы');

        const mapped: FileItem[] = resp.items.map(it => ({
          id: it.id,
          name: it.name,
          type: it.type === 'folder' ? 'folder' : 'file',
          fileType: it.type === 'folder' ? undefined : it.type,
          size: undefined,
          createdAt: new Date(it.createdAt),
          updatedAt: it.updatedAt ? new Date(it.updatedAt) : new Date(it.createdAt)
        }));

        setFiles(mapped);

        const parts = (resp.path || 'Все файлы').split('/').filter(Boolean);
        const crumbs = parts.map((name, idx) => {
          let id: string | null = null;

          if (idx === parts.length - 1) {
            // Последняя — текущая папка
            id = currentFolderId;
          } else {
            // ищем id среди текущего уровня файлов
            const parentFiles = idx === 0 ? mapped : [];
            const match = parentFiles.find(f => f.name === name && f.type === 'folder');
            if (match) id = match.id;
          }

          return { name, id };
        });

        setBreadcrumbItems(crumbs);
      } catch (e) {
        console.error("Failed to load folder items", e);
        toast.error("Failed to load folder contents");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentFolderId]);

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
    } else {
      toast.info(`Opening file: ${item.name}`);
    }
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name,
      type: 'folder',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setFiles(prev => [newFolder, ...prev]);
    toast.success(`Folder "${name}" created successfully`);
  };

  const handleUploadFiles = (uploadedFiles: File[]) => {
    const newFiles: FileItem[] = uploadedFiles.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: 'file',
      fileType: file.type,
      size: file.size,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    setFiles(prev => [...newFiles, ...prev]);
    toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
  };

    // прокидываем в сайдбар — при клике на папку будет устанавливаться currentFolderId
  const handleFolderClick = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onFolderClick={handleFolderClick} />
        
        <main className="flex-1 p-6 flex flex-col overflow-hidden">
          <Breadcrumbs
            items={breadcrumbItems}
            onClick={(id) => setCurrentFolderId(id)}
          />
          
          <ActionBar
            onUploadFile={() => setIsUploadOpen(true)}
            onCreateFolder={() => setIsCreateFolderOpen(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <div className="flex-1 overflow-y-auto mt-4">
            {loading ? (
              <div className="p-6">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <FileTable
                items={files}
                viewMode={viewMode}
                onItemDoubleClick={handleItemDoubleClick}
              />
            )}
          </div>
        </main>
      </div>

      <Footer />

      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onConfirm={handleCreateFolder}
      />

      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadFiles}
      />
    </div>
  );
};

export default Home;