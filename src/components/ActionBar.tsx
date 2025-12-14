import React, { useState, useEffect, useRef } from 'react';
import { Upload, FolderPlus, Search, Grid, List, SortAsc } from 'lucide-react';

interface ActionBarProps {
  onUploadFile: () => void;
  onCreateFolder: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (field: 'name' | 'createdAt', dir: 'asc' | 'desc') => void;
  sortField: 'name' | 'createdAt';
  sortDirection: 'asc' | 'desc';
}

const ActionBar: React.FC<ActionBarProps> = (props) => {
  const {
    onUploadFile,
    onCreateFolder,
    viewMode,
    onViewModeChange,
    onSortChange,
    sortField,
    sortDirection
  } = props;

  const [openSort, setOpenSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onUploadFile}
          className="flex items-center space-x-2 bg-[#4B67F5] text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
        >
          <Upload size={16} />
          <span>Upload File</span>
        </button>
        
        <button
          onClick={onCreateFolder}
          className="flex items-center space-x-2 bg-white border border-gray-300 text-[#3A3A3C] px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <FolderPlus size={16} />
          <span>New Folder</span>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5] focus:border-transparent"
          />
        </div>

        <div className="flex items-center bg-white border border-gray-300 rounded-xl overflow-hidden">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 transition-colors ${
              viewMode === 'list' ? 'bg-[#4B67F5] text-white' : 'text-[#3A3A3C] hover:bg-gray-100'
            }`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 transition-colors ${
              viewMode === 'grid' ? 'bg-[#4B67F5] text-white' : 'text-[#3A3A3C] hover:bg-gray-100'
            }`}
          >
            <Grid size={16} />
          </button>
        </div>

        <div className="relative" ref={sortRef}>
          <button
            className="p-2 text-[#3A3A3C] hover:text-blue-600 rounded-xl transition-colors"
            onClick={() => setOpenSort(prev => !prev)}
          >
            <SortAsc
              size={16}
              className={`transform transition-transform duration-200 ${
                openSort ? "rotate-180" : "rotate-0"
              }`}
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
      </div>
    </div>
  );
};

export default ActionBar;