import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Home, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface FolderNode {
  id: string;
  name: string;
  children?: FolderNode[];
  isExpanded?: boolean;
}

const mockFolders: FolderNode[] = [
  {
    id: '1',
    name: 'Documents',
    children: [
      { id: '1-1', name: 'Work', children: [{ id: '1-1-1', name: 'Projects' }] },
      { id: '1-2', name: 'Personal' }
    ]
  },
  {
    id: '2',
    name: 'Images',
    children: [
      { id: '2-1', name: 'Photos' },
      { id: '2-2', name: 'Screenshots' }
    ]
  },
  { id: '3', name: 'Videos' },
  { id: '4', name: 'Music' }
];

const Sidebar: React.FC = () => {
  const [folders, setFolders] = useState<FolderNode[]>(mockFolders);
  const location = useLocation();

  const toggleFolder = (folderId: string) => {
    const updateFolders = (nodes: FolderNode[]): FolderNode[] => {
      return nodes.map(node => {
        if (node.id === folderId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: updateFolders(node.children) };
        }
        return node;
      });
    };
    setFolders(updateFolders(folders));
  };

  const renderFolderTree = (nodes: FolderNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors ${
            level > 0 ? `ml-${level * 4}` : ''
          }`}
          onClick={() => node.children && toggleFolder(node.id)}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {node.children && (
            <button className="mr-1 p-0.5 hover:bg-gray-200 rounded">
              {node.isExpanded ? (
                <ChevronDown size={16} className="text-[#3A3A3C]" />
              ) : (
                <ChevronRight size={16} className="text-[#3A3A3C]" />
              )}
            </button>
          )}
          {node.children ? (
            node.isExpanded ? (
              <FolderOpen size={16} className="text-[#4B67F5] mr-2" />
            ) : (
              <Folder size={16} className="text-[#4B67F5] mr-2" />
            )
          ) : (
            <Folder size={16} className="text-[#4B67F5] mr-2" />
          )}
          <span className="text-sm text-[#3A3A3C] truncate">{node.name}</span>
        </div>
        {node.children && node.isExpanded && renderFolderTree(node.children, level + 1)}
      </div>
    ));
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          <Link
            to="/"
            className={`flex items-center py-2 px-3 rounded-lg transition-colors ${
              location.pathname === '/' 
                ? 'bg-[#4B67F5] text-white' 
                : 'text-[#3A3A3C] hover:bg-gray-100'
            }`}
          >
            <Home size={16} className="mr-2" />
            <span className="text-sm">Home</span>
          </Link>
          
          <Link
            to="/trash"
            className={`flex items-center py-2 px-3 rounded-lg transition-colors ${
              location.pathname === '/trash' 
                ? 'bg-[#4B67F5] text-white' 
                : 'text-[#3A3A3C] hover:bg-gray-100'
            }`}
          >
            <Trash2 size={16} className="mr-2" />
            <span className="text-sm">Trash</span>
          </Link>
        </nav>

        <div className="mt-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Folders
          </h3>
          <div className="space-y-1">
            {renderFolderTree(folders)}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;