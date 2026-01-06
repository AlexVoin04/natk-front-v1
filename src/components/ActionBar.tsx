import React, { useState, useEffect, useRef } from 'react';
import { Upload, FolderPlus, Search, Grid, List, SortAsc, Trash2 } from 'lucide-react';

interface ActionBarProps {
  onUploadFile: () => void;
  onCreateFolder: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (field: 'name' | 'createdAt', dir: 'asc' | 'desc') => void;
  sortField: 'name' | 'createdAt';
  sortDirection: 'asc' | 'desc';
  selectedFilesCount?: number;
  selectedFoldersCount?: number;
  onDeleteSelected?: () => void;
  onClearSelection?: () => void;
}

const ActionBar: React.FC<ActionBarProps> = (props) => {
  const {
    onUploadFile,
    onCreateFolder,
    viewMode,
    onViewModeChange,
    onSortChange,
    sortField,
    sortDirection, 
    selectedFilesCount = 0, 
    selectedFoldersCount = 0, 
    onDeleteSelected,
    onClearSelection
  } = props;

  const [openSort, setOpenSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const totalSelected = selectedFilesCount + selectedFoldersCount;

  // Закрытие при клике вне элемента
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setOpenSort(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && totalSelected > 0) {
        onClearSelection?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [totalSelected, onClearSelection]);

  return (
    
    <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {totalSelected > 0 ? (
          <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
            
            <button
              onClick={onClearSelection}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-100 text-blue-600"
              title="Clear selection"
            >
              ✕
            </button>

            <div className="flex flex-col leading-tight">
              <div className="text-sm font-semibold text-blue-900">
                {totalSelected} selected
              </div>

              <div className="text-xs text-blue-600">
                {selectedFoldersCount} folders · {selectedFilesCount} files
              </div>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={onUploadFile}
              className="flex items-center gap-2 bg-[#4B67F5] text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Upload size={16} />
              <span>Upload</span>
            </button>

            <button
              onClick={onCreateFolder}
              className="flex items-center gap-2 bg-white border border-gray-300 text-[#3A3A3C] px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <FolderPlus size={16} />
              <span>New Folder</span>
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">

        {totalSelected > 0 ? (
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm rounded-xl border border-gray-300 text-[#3A3A3C] hover:bg-gray-100 transition">
              Move
            </button>
            <button className="px-3 py-2 text-sm rounded-xl border border-gray-300 text-[#3A3A3C] hover:bg-gray-100 transition">
              Download
            </button>
            <button
              onClick={onDeleteSelected}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-red-700 hover:shadow transition"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5]"
              />
            </div>

            <div className="flex items-center bg-white border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-[#4B67F5] text-white'
                    : 'text-[#3A3A3C] hover:bg-gray-100'
                }`}
              >
                <List size={16} />
              </button>

              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-[#4B67F5] text-white'
                    : 'text-[#3A3A3C] hover:bg-gray-100'
                }`}
              >
                <Grid size={16} />
              </button>
            </div>

            <div className="relative" ref={sortRef}>
              <button
                className="p-2 text-[#3A3A3C] hover:text-blue-600 rounded-xl"
                onClick={() => setOpenSort(v => !v)}
              >
                <SortAsc
                  size={16}
                  className={`transition-transform ${openSort ? "rotate-180" : ""}`}
                />
              </button>

              {openSort && (
                <div className="absolute right-0 mt-2 bg-white border rounded-xl shadow-lg p-2 w-44 text-sm z-20">
                  <div className="font-medium mb-2 text-gray-600">Sort by</div>

                  <button
                    className="block w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                    onClick={() => onSortChange('name', sortDirection === 'asc' ? 'desc' : 'asc')}
                  >
                    Name {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </button>

                  <button
                    className="block w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                    onClick={() => onSortChange('createdAt', sortDirection === 'asc' ? 'desc' : 'asc')}
                  >
                    Created {sortField === 'createdAt' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionBar;