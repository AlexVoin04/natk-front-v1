import React, { useState } from 'react';
import { 
  File, 
  Folder, 
  Image, 
  FileText, 
  Music, 
  Video, 
  MoreVertical,
  Download,
  Edit,
  Trash2,
  Copy,
  Move,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: string;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FileTableProps {
  items: FileItem[];
  onItemDoubleClick: (item: FileItem) => void;
}

const FileTable: React.FC<FileTableProps> = ({ items, onItemDoubleClick }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <Folder size={20} className="text-[#4B67F5]" />;
    }

    const fileType = item.fileType?.toLowerCase();
    if (fileType?.includes('image')) {
      return <Image size={20} className="text-green-500" />;
    }
    if (fileType?.includes('video')) {
      return <Video size={20} className="text-red-500" />;
    }
    if (fileType?.includes('audio')) {
      return <Music size={20} className="text-purple-500" />;
    }
    if (fileType?.includes('text') || fileType?.includes('document')) {
      return <FileText size={20} className="text-blue-500" />;
    }
    return <File size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, itemId });
  };

  const handleItemClick = (itemId: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setSelectedItems([itemId]);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#EDEDED] border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-[#3A3A3C] text-sm">Name</th>
              <th className="text-left py-3 px-4 font-medium text-[#3A3A3C] text-sm">Type</th>
              <th className="text-left py-3 px-4 font-medium text-[#3A3A3C] text-sm">Size</th>
              <th className="text-left py-3 px-4 font-medium text-[#3A3A3C] text-sm">Modified</th>
              <th className="text-left py-3 px-4 font-medium text-[#3A3A3C] text-sm">Created</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedItems.includes(item.id) ? 'bg-blue-50' : ''
                }`}
                onClick={(e) => handleItemClick(item.id, e)}
                onDoubleClick={() => onItemDoubleClick(item)}
                onContextMenu={(e) => handleContextMenu(e, item.id)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(item)}
                    <span className="text-[#3A3A3C] font-medium truncate">{item.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#3A3A3C] text-sm">
                  {item.type === 'folder' ? 'Folder' : item.fileType || 'File'}
                </td>
                <td className="py-3 px-4 text-[#3A3A3C] text-sm">
                  {formatFileSize(item.size)}
                </td>
                <td className="py-3 px-4 text-[#3A3A3C] text-sm">
                  {format(item.updatedAt, 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="py-3 px-4 text-[#3A3A3C] text-sm">
                  {format(item.createdAt, 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="py-3 px-4">
                  <button
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, item.id);
                    }}
                  >
                    <MoreVertical size={16} className="text-[#3A3A3C]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contextMenu && (
        <div
          className="fixed bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm text-[#3A3A3C]">
            <Download size={16} />
            <span>Download</span>
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm text-[#3A3A3C]">
            <Edit size={16} />
            <span>Rename</span>
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm text-[#3A3A3C]">
            <Copy size={16} />
            <span>Copy</span>
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm text-[#3A3A3C]">
            <Move size={16} />
            <span>Move</span>
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm text-[#3A3A3C]">
            <Info size={16} />
            <span>Properties</span>
          </button>
          <hr className="my-2 border-gray-200" />
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm text-red-500">
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FileTable;