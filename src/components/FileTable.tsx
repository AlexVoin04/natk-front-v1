import React, { useState } from 'react';
import { 
  File, 
  Folder, 
  Image, 
  FileText,
  FileArchive,
  FileSpreadsheet,
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

const fileTypeMap: Record<string, JSX.Element> = {
  image: <Image size={48} className="text-green-500" />,
  video: <Video size={48} className="text-red-500" />,
  audio: <Music size={48} className="text-purple-500" />,
  text: <FileText size={48} className="text-blue-500" />,
  pdf: <FileText size={48} className="text-red-800" />,        
  ppt: <FileText size={48} className="text-orange-500" />,      
  xls: <FileSpreadsheet size={48} className="text-green-700" />, 
  archive: <FileArchive size={48} className="text-gray-700" />, 
};

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
  viewMode: 'grid' | 'list';
  onItemDoubleClick: (item: FileItem) => void;
  onDownloadFile: (id: string) => void;
}

  const FileTable: React.FC<FileTableProps> = ({ items, viewMode, onItemDoubleClick, onDownloadFile }) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
    const [showTooltipFor, setShowTooltipFor] = useState<string | null>(null);

    const getFileIcon = (item: FileItem) => {
      if (item.type === 'folder') return <Folder size={48} className="text-[#4B67F5]" />;

    const fileType = item.fileType?.toLowerCase() || '';
    
    if (fileType.includes('image')) return fileTypeMap.image;
    if (fileType.includes('video')) return fileTypeMap.video;
    if (fileType.includes('audio')) return fileTypeMap.audio;
    if (fileType.includes('text')|| fileType.includes('.document')) return fileTypeMap.text;
    if (fileType.includes('pdf')) return fileTypeMap.pdf;
    if (fileType.includes('ppt') || fileType.includes('presentation')) return fileTypeMap.ppt;
    if (fileType.includes('xls') || fileType.includes('spreadsheet')) return fileTypeMap.xls;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z') || fileType.includes('archive')) return fileTypeMap.archive;

    return <File size={48} className="text-gray-500" />; 
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

  const getContextMenuPosition = () => {
    if (!contextMenu) return { left: 0, top: 0 };
    
    const menuWidth = 192; // min-w-48
    const menuHeight = 200; // approximate height
    let left = contextMenu.x;
    let top = contextMenu.y;
    
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - 10;
    }
    if (top + menuHeight > window.innerHeight) {
      top = window.innerHeight - menuHeight - 10;
    }
    
    // Ensure not negative
    left = Math.max(10, left);
    top = Math.max(10, top);
    
    return { left, top };
  };

  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`group relative bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition-colors border-2 ${
                selectedItems.includes(item.id) ? 'border-[#4B67F5] bg-blue-50' : 'border-transparent'
              }`}
              onMouseEnter={() => setShowTooltipFor(item.id)}
              onMouseLeave={() => setShowTooltipFor(null)}
              onClick={(e) => handleItemClick(item.id, e)}
              onDoubleClick={() => onItemDoubleClick(item)}
              onContextMenu={(e) => handleContextMenu(e, item.id)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-3">
                  {getFileIcon(item)}
                </div>
                <span className="text-sm text-[#3A3A3C] font-medium truncate w-full">
                  {item.name}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {format(item.updatedAt, 'MMM dd, yyyy')}
                </span>
              </div>
              {showTooltipFor === item.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                                bg-black text-white text-xs py-1 px-2 rounded-lg shadow-lg 
                                whitespace-nowrap z-10">
                  {item.name}
                </div>
              )}
              
              <button
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-lg transition-opacity"
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setShowTooltipFor(null);
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  setShowTooltipFor(item.id);
                }}
                
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, item.id);
                }}
              >
                <MoreVertical size={16} className="text-[#3A3A3C]" />
              </button>
            </div>
          ))}
        </div>

        {contextMenu && (
          <div
            className="fixed bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-48"
            style={getContextMenuPosition()}
            onMouseLeave={() => setContextMenu(null)}
          >
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm text-[#3A3A3C]"
              onClick={() => {
                onDownloadFile(contextMenu.itemId);
                setContextMenu(null);
              }}
            >
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
  }

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
                    <span
                      className="text-[#3A3A3C] font-medium truncate"
                      onMouseEnter={() => setShowTooltipFor(item.id)}
                      onMouseLeave={() => setShowTooltipFor(null)}
                    >
                      {item.name}
                    </span>
                  </div>
                  {showTooltipFor === item.id && (
                    <div className="absolute bottom-full left-0 mb-2 
                                    bg-black text-white text-xs py-1 px-2 rounded-lg shadow-lg 
                                    whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
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
          style={getContextMenuPosition()}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm text-[#3A3A3C]"
            onClick={() => {
              onDownloadFile(contextMenu.itemId);
              setContextMenu(null);
            }}
          >
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