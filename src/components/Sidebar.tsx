import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Home, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { fetchFolderTree } from '../services/storage';
import type { FolderTreeDto } from '../services/interfaces';

interface FolderNode extends FolderTreeDto {
  isExpanded?: boolean;
}

type Props = {
  onFolderClick?: (folderId: string | null) => void;
};

const Sidebar: React.FC<Props> = ({ onFolderClick }) => {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const data = await fetchFolderTree();

        // Добавляем флаг isExpanded каждому узлу
        const addFlags = (nodes: FolderTreeDto[]): FolderNode[] =>
          nodes.map(n => ({
            ...n,
            isExpanded: false,
            children: n.children ? addFlags(n.children) : []
          }));

        const root: FolderNode = {
          id: "all",
          name: "Все файлы",
          depth: 0,
          isExpanded: true,
          children: addFlags(data)
        };

        setFolders([root]);
      } catch (e) {
        console.error("Failed to load folder tree", e);
      } finally {
        setLoading(false);
      }
    };

    loadFolders();
  }, []);

  const toggleFolder = (folderId: string) => {
    const update = (nodes: FolderNode[]): FolderNode[] =>
      nodes.map(n => ({
        ...n,
        isExpanded: n.id === folderId ? !n.isExpanded : n.isExpanded,
        children: n.children ? update(n.children) : []
      }));

    setFolders(update(folders));
  };

  const handleClickNode = (node: FolderNode) => {
    // "all" -> null, иначе id
    const id = node.id === 'all' ? null : node.id;
    onFolderClick?.(id);
  };

  const renderTree = (nodes: FolderNode[], level = 0): JSX.Element[] => {
  return nodes.map(node => (
    <div key={node.id} className="select-none">
      <div
        className="flex items-center py-2 px-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => handleClickNode(node)}
      >
        {/* Кнопка раскрытия */}
        {node.children.length > 0 ? (
          <button
            className="mr-1 w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(node.id);
            }}
          >
            {node.isExpanded ? (
              <ChevronDown size={16} className="text-[#3A3A3C]" />
            ) : (
              <ChevronRight size={16} className="text-[#3A3A3C]" />
            )}
          </button>
        ) : (
          <div className="mr-1 w-5 h-5 flex-shrink-0" />
        )}

        {/* Иконка папки */}
        {node.isExpanded ? (
          <FolderOpen size={16} className="text-[#4B67F5] mr-2 flex-shrink-0" />
        ) : (
          <Folder size={16} className="text-[#4B67F5] mr-2 flex-shrink-0" />
        )}

        {/* Название */}
        <span className="text-sm text-[#3A3A3C] truncate">{node.name}</span>
      </div>

      {/* Рекурсивный рендер */}
      {node.isExpanded && node.children.length > 0 && renderTree(node.children, level + 1)}
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

          {loading ? (
            <p className="text-sm text-gray-400 px-3">Loading...</p>
          ) : folders.length === 0 ? (
            <p className="text-sm text-gray-400 px-3">No folders</p>
          ) : (
            <div className="space-y-1">
              {renderTree(folders)}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;