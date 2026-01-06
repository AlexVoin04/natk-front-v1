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
  //иконки статуса сканирования
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import ContextMenu from "./ContextMenu";
import { type FileItem } from '../services/interfaces';
import TooltipFileNamePortal from './TooltipFileNamePortal';
import { CircleCheckbox } from "./CircleCheckbox";

const fileTypeMap: Record<string, React.JSX.Element> = {
  image: <Image size={48} className="text-green-500" />,
  video: <Video size={48} className="text-red-500" />,
  audio: <Music size={48} className="text-purple-500" />,
  text: <FileText size={48} className="text-blue-500" />,
  pdf: <FileText size={48} className="text-red-800" />,        
  ppt: <FileText size={48} className="text-orange-500" />,      
  xls: <FileSpreadsheet size={48} className="text-green-700" />, 
  archive: <FileArchive size={48} className="text-gray-700" />, 
  txt: <FileText size={48} className="text-gray-500" />,
};

const antivirusIcons: Record<string, React.JSX.Element> = {
  READY: <ShieldCheck size={14} className="text-green-500" />,
  SCANNING: <Loader2 size={14} className="text-blue-500 animate-spin" />,
  UPLOADED_PENDING_SCAN: <Clock size={14} className="text-gray-400" />,
  INFECTED: <ShieldX size={14} className="text-red-600" />,
  ERROR: <ShieldAlert size={14} className="text-orange-500" />
};

interface FileTableProps {
  items: FileItem[];
  viewMode: 'grid' | 'list';
  onItemDoubleClick: (item: FileItem) => void;
  onDownloadFile: (id: string) => void;
  onOpenProperties?: (id: string) => void;
  onSortChange: (field: 'name' | 'createdAt', dir: 'asc' | 'desc') => void;
  onRename?: (item: { id: string; type: "folder" | "file"; name: string }) => void;
  onDeleteItem: (id: string, type: "file" | "folder") => void;
  onCopy?: (id: string) => void;
  onMove?: (item: { id: string; type: "folder" | "file"; name: string }) => void;
  sortField: 'name' | 'createdAt';
  sortDirection: 'asc' | 'desc';
  onCreateFolder: () => void;
  onUploadFile: () => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export const resolveFileIcon = (item: FileItem) => {
  const icon =
    item.type === 'folder'
      ? <Folder size={48} className="text-[#eab308]" />
      : (() => {
          const fileType = item.fileType?.toLowerCase() || "";
          if (fileType.includes("image")) return fileTypeMap.image;
          if (fileType.includes("video")) return fileTypeMap.video;
          if (fileType.includes("audio")) return fileTypeMap.audio;
          if (fileType.includes("pdf")) return fileTypeMap.pdf;
          if (fileType.includes("ppt") || fileType.includes("presentation")) return fileTypeMap.ppt;
          if (fileType.includes("xls") || fileType.includes("spreadsheet")) return fileTypeMap.xls;
          if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("7z"))
            return fileTypeMap.archive;
          if (fileType.includes("text")) return fileTypeMap.txt;
          if (fileType.includes(".document"))
            return fileTypeMap.text;
          return <File size={48} className="text-gray-500" />;
        })();

  return (
    <div className="relative">
      {icon}
      {item.type !== "folder" && <AntivirusBadge status={item.antivirusStatus} />}
    </div>
  );
};

const AntivirusBadge = ({ status }: { status?: string }) => {
  if (!status) return null;

  return (
    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow">
      {antivirusIcons[status]}
    </div>
  );
};

const FileTable: React.FC<FileTableProps> = ({ items, viewMode, onCreateFolder, onUploadFile, onItemDoubleClick, onDownloadFile, onOpenProperties, onDeleteItem, onRename, onCopy, onMove, selectedIds, onSelectionChange }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center flex-1 min-h-[300px]">
        <Folder size={64} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-[#3A3A3C] mb-2">The folder is empty</h3>
        <p className="text-sm text-gray-500 mb-6">
          There are no files or folders here yet
        </p>
        <div className="flex gap-3 text-sm text-gray-500">
          <button 
            className="flex items-center gap-1 hover:text-[#4B67F5] transition-colors"
            onClick={onCreateFolder}
          >
            Create a folder
          </button>
          <span>•</span>
          <button 
            className="hover:text-[#4B67F5] transition-colors"
            onClick={onUploadFile}
          >
            Upload files
          </button>
        </div>
      </div>
    );
  }
    
  // const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
  const [showTooltipFor, setShowTooltipFor] = useState<string | null>(null);
  const [tooltipTarget, setTooltipTarget] = useState<DOMRect | null>(null);
  const [tooltipText, setTooltipText] = useState<string | null>(null);

  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const selectedItems = selectedIds ?? internalSelected;
  const setSelectedItems = (ids: string[]) => {
    if (onSelectionChange) onSelectionChange(ids);
    else setInternalSelected(ids);
  };

  const formatFileSize = (bytes?: number| null) => {
    if (bytes == null) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const safeFormatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return format(d, "dd.MM.yyyy HH:mm");
  };

  const openContextMenu = (x: number, y: number, itemId: string) => {
    setContextMenu({ x, y, itemId });
  };

  const handleContextMenuOnItem = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // ПКМ по элементу — делаем его активным
    // if (!selectedItems.includes(itemId)) {
    //   setSelectedItems([itemId]);
    // }

    openContextMenu(e.clientX, e.clientY, itemId);
  };

  const handleContextMenuButton = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    e.preventDefault();

    // НЕ трогаем selectedItems
    openContextMenu(e.clientX, e.clientY, itemId);
  };

  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-auto max-h-full">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`group relative select-none bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition-colors border-2 ${
                selectedItems.includes(item.id) ? 'border-[#4B67F5] bg-blue-50' : 'border-transparent'
              }`}
              onMouseEnter={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setTooltipTarget(rect);
                setTooltipText(item.name);
              }}
              onMouseLeave={() => {
                setTooltipTarget(null);
                setTooltipText(null);
              }}
              onDoubleClick={() => onItemDoubleClick(item)}
              onContextMenu={(e) => handleContextMenuOnItem(e, item.id)}
            >
              <div className="absolute top-2 left-2">
                <CircleCheckbox
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    const next = e.target.checked
                      ? [...selectedItems, item.id]
                      : selectedItems.filter(id => id !== item.id);
                    setSelectedItems(next);
                  }}
                  className={`transition-opacity ${
                    selectedItems.includes(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                />
              </div>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="mb-3">
                  {resolveFileIcon(item)}
                </div>
                <span className="text-sm text-[#3A3A3C] font-medium truncate w-full">
                  {item.name}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {safeFormatDate(item.createdAt)}
                </span>
              </div>
              
              <button
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-lg transition-opacity"
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setTooltipTarget(null);
                  setTooltipText(null);
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  const card = e.currentTarget.closest(".group") as HTMLElement;
                  if (!card) return;

                  const rect = card.getBoundingClientRect();
                  setTooltipTarget(rect);
                  setTooltipText(item.name);
                }}
                
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenuButton(e, item.id);
                }}
              >
                <MoreVertical size={16} className="text-[#3A3A3C]" />
              </button>
            </div>
          ))}
        </div>

        <ContextMenu
          x={contextMenu?.x ?? 0}
          y={contextMenu?.y ?? 0}
          item={items.find(i => i.id === contextMenu?.itemId) || null}
          onDownload={onDownloadFile}
          onCopy={(id) => onCopy && onCopy(id)}
          onProperties={onOpenProperties || (() => {})}
          onRename={(itm) => onRename && onRename(itm)}
          onClose={() => setContextMenu(null)}
          onDelete={(item) => onDeleteItem(item.id, item.type)}
          onMove={(item) => onMove && onMove(item)}
        />

        {tooltipTarget && tooltipText && (
        <TooltipFileNamePortal targetRect={tooltipTarget}>
          {tooltipText}
        </TooltipFileNamePortal>
      )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-auto max-h-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#EDEDED] border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-[#3A3A3C] text-sm w-6">
                <CircleCheckbox
                  checked={selectedItems.length === items.length && items.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedItems(items.map(i => i.id));
                    else setSelectedItems([]);
                  }}
                />
              </th>
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
                className={`select-none border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedItems.includes(item.id) ? 'bg-blue-50' : ''
                }`}
                onDoubleClick={() => onItemDoubleClick(item)}
                onContextMenu={(e) => handleContextMenuOnItem(e, item.id)}
                >
                <td className="py-3 px-4">
                  <CircleCheckbox
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      const next = e.target.checked
                        ? [...selectedItems, item.id]
                        : selectedItems.filter(id => id !== item.id);
                      setSelectedItems(next);
                    }}
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    {resolveFileIcon(item)}
                    <span
                      className="text-[#3A3A3C] font-medium truncate"
                      onMouseEnter={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltipTarget(rect);
                        setTooltipText(item.name);
                      }}
                      onMouseLeave={() => {
                        setTooltipTarget(null);
                        setTooltipText(null);
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#3A3A3C] text-sm">
                  {item.type === 'folder' ? 'Folder' : item.fileType || 'File'}
                </td>
                <td className="py-3 px-4 text-[#3A3A3C] text-sm">
                  {formatFileSize(item.size)}
                </td>
                <td className="py-3 px-4 text-[#3A3A3C] text-sm">
                  {safeFormatDate(item.updatedAt)}
                </td>
                <td className="py-3 px-4 text-[#3A3A3C] text-sm">
                  {safeFormatDate(item.createdAt)}
                </td>
                <td className="py-3 px-4">
                  <button
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenuButton(e, item.id);
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

      <ContextMenu
        x={contextMenu?.x ?? 0}
        y={contextMenu?.y ?? 0}
        item={items.find(i => i.id === contextMenu?.itemId) || null}
        onDownload={onDownloadFile}
        onCopy={(id) => onCopy && onCopy(id)}
        onProperties={onOpenProperties || (() => {})}
        onRename={(itm) => onRename && onRename(itm)}
        onClose={() => setContextMenu(null)}
        onDelete={(item) => onDeleteItem(item.id, item.type)}
        onMove={(item) => onMove && onMove(item)}
      />

      {tooltipTarget && tooltipText && (
        <TooltipFileNamePortal targetRect={tooltipTarget}>
          {tooltipText}
        </TooltipFileNamePortal>
      )}
    </div>
  );
};

export default FileTable;