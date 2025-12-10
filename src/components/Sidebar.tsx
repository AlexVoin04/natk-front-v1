import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Home, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { fetchFolderTree } from '../services/storage';
import type { FolderTreeDto } from '../services/interfaces';

interface FolderNode extends FolderTreeDto {
  isExpanded?: boolean;
}

type Props = {
  onFolderClick?: (folderId: string | null) => void;
  refreshTrigger?: any;
};

// Портальный тултип
const Tooltip: React.FC<{ text: string; target: HTMLElement | null }> = ({ text, target }) => {
  if (!target) return null;

  const rect = target.getBoundingClientRect();

    // Показываем тултип справа от элемента, с небольшим отступом
  const top = rect.top + rect.height / 2;
  const left = rect.right + 8; // справа от элемента, 8px отступ

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: top,
        left: left,
        transform: 'translateY(-50%)',
      }}
      className="px-2 py-1 bg-black text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none"
    >
      {text}
      {/* Стрелка */}
      <div
        style={{
          position: 'absolute',
          left: '-4px',
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          width: '8px',
          height: '8px',
          backgroundColor: 'black',
        }}
      />
    </div>,
    document.body
  );
};

const Sidebar: React.FC<Props> = ({ onFolderClick, refreshTrigger }) => {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [tooltipTarget, setTooltipTarget] = useState<HTMLElement | null>(null);
  const [tooltipText, setTooltipText] = useState('');
  const location = useLocation();

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const data = await fetchFolderTree();

        const savedExpanded: string[] =
        JSON.parse(localStorage.getItem("sidebar_expanded") || "[]")

        const savedSelected =
        localStorage.getItem("sidebar_selected") || null;

        // Добавляем флаг isExpanded каждому узлу
        const addFlags = (nodes: FolderTreeDto[]): FolderNode[] =>
          nodes.map(n => ({
            ...n,
            isExpanded: savedExpanded.includes(n.id),
            children: n.children ? addFlags(n.children) : []
          }));

        const root: FolderNode = {
          id: "all",
          name: "Все файлы",
          depth: 0,
          isExpanded: true,
          children: addFlags(data)
        };

        setSelectedFolder(savedSelected);
        setFolders([root]);
      } catch (e) {
        console.error("Failed to load folder tree", e);
      } finally {
        setLoading(false);
      }
    };

    loadFolders();
  }, [refreshTrigger]);

  const toggleFolder = (folderId: string) => {
    const collectExpanded = (nodes: FolderNode[], acc: string[]) => {
      nodes.forEach(n => {
        if (n.isExpanded) acc.push(n.id);
        if (n.children) collectExpanded(n.children, acc);
      });
    };

    const update = (nodes: FolderNode[]): FolderNode[] =>
      nodes.map(n => ({
        ...n,
        isExpanded: n.id === folderId ? !n.isExpanded : n.isExpanded,
        children: n.children ? update(n.children) : []
    }));

    const updated = update(folders);

    // Сохраняем открытые
    const expandedList: string[] = [];
    collectExpanded(updated, expandedList);

    localStorage.setItem("sidebar_expanded", JSON.stringify(expandedList));

    setFolders(update(folders));
  };

  const handleClickNode = (node: FolderNode) => {
    // "all" -> null, иначе id
    const id = node.id === 'all' ? null : node.id;
    setSelectedFolder(id);
    localStorage.setItem("sidebar_selected", id || "");
    onFolderClick?.(id);
  };

  const handleMouseEnter = (e: React.MouseEvent, text: string) => {
    setTooltipTarget(e.currentTarget as HTMLElement);
    setTooltipText(text);
  };
  const handleMouseLeave = () => {
    setTooltipTarget(null);
    setTooltipText('');
  };

  const renderTree = (nodes: FolderNode[], level = 0): JSX.Element[] => {
  return nodes.map(node => (
    <div key={node.id} className="select-none">
      <div
        className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors
          ${selectedFolder === (node.id === 'all' ? null : node.id)
            ? 'bg-blue-100 text-blue-700'
            : 'hover:bg-gray-100 text-[#3A3A3C]'
          }
        `}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => handleClickNode(node)}
        onMouseEnter={e => handleMouseEnter(e, node.name)}
        onMouseLeave={handleMouseLeave}
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
          <FolderOpen size={24} className="text-[#eab308] mr-2 flex-shrink-0" />
        ) : (
          <Folder size={24} className="text-[#eab308] mr-2 flex-shrink-0" />
        )}

        {/* Название с тултипом */}
        <span className="truncate block text-sm">{node.name}</span>
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
      {/* Портальный тултип */}
      <Tooltip text={tooltipText} target={tooltipTarget} />
    </aside>
  );
};

export default Sidebar;