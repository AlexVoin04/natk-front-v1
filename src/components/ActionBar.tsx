import React from 'react';
import { Upload, FolderPlus, Search, Grid, List, SortAsc } from 'lucide-react';

interface ActionBarProps {
  onUploadFile: () => void;
  onCreateFolder: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  onUploadFile,
  onCreateFolder,
  viewMode,
  onViewModeChange
}) => {
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

        <button className="p-2 text-[#3A3A3C] hover:bg-gray-100 rounded-xl transition-colors">
          <SortAsc size={16} />
        </button>
      </div>
    </div>
  );
};

export default ActionBar;