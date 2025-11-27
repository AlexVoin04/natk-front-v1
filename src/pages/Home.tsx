import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import ActionBar from '../components/ActionBar';
import FileTable from '../components/FileTable';
import CreateFolderDialog from '../components/CreateFolderDialog';
import UploadDialog from '../components/UploadDialog';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: string;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
}

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '2',
    name: 'Images',
    type: 'folder',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-11-28')
  },
  {
    id: '3',
    name: 'Project Proposal.pdf',
    type: 'file',
    fileType: 'application/pdf',
    size: 2048576,
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-11-25')
  },
  {
    id: '4',
    name: 'Vacation Photo.jpg',
    type: 'file',
    fileType: 'image/jpeg',
    size: 5242880,
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-15')
  },
  {
    id: '5',
    name: 'Meeting Recording.mp4',
    type: 'file',
    fileType: 'video/mp4',
    size: 104857600,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  }
];

const Home: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const breadcrumbItems = [
    { name: 'My Files', path: '/' }
  ];

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      toast.info(`Opening folder: ${item.name}`);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <Breadcrumbs items={breadcrumbItems} />
          
          <ActionBar
            onUploadFile={() => setIsUploadOpen(true)}
            onCreateFolder={() => setIsCreateFolderOpen(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <FileTable
            items={files}
            viewMode={viewMode}
            onItemDoubleClick={handleItemDoubleClick}
          />
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