import React, { useState, useEffect, useRef } from 'react';
import { Upload, FolderPlus, Search, Grid, List, SortAsc, Trash2 } from 'lucide-react';

export type SearchMode = 'all' | 'files' | 'folders';

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
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  searchValue: string;
  onSearchSubmit: (value: string) => void;
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
    onClearSelection,
    searchMode,
    onSearchModeChange,
    onSearchSubmit,
    searchValue
  } = props;

  const [openSort, setOpenSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [openSearchType, setOpenSearchType] = useState(false);
  const searchTypeRef = useRef<HTMLDivElement>(null);

  const totalSelected = selectedFilesCount + selectedFoldersCount;

  const [localSearch, setLocalSearch] = useState(searchValue);

  const canSearch = localSearch.trim().length >= 3;

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Закрытие при клике вне элемента
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setOpenSort(false);
      }
      if (searchTypeRef.current && !searchTypeRef.current.contains(e.target as Node)) {
        setOpenSearchType(false);
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
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-sm sm:px-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {totalSelected > 0 ? (
            <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 sm:w-auto sm:justify-start">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={onClearSelection}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-blue-600 hover:bg-blue-100"
                  title="Clear selection"
                >
                  ✕
                </button>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-blue-900">
                    {totalSelected} selected
                  </div>
                  <div className="text-xs text-blue-600">
                    {selectedFoldersCount} folders · {selectedFilesCount} files
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={onUploadFile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4B67F5] px-4 py-2.5 text-white transition-colors hover:bg-blue-600 sm:w-auto"
              >
                <Upload size={16} />
                <span className="whitespace-nowrap">Upload</span>
              </button>

              <button
                onClick={onCreateFolder}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-[#3A3A3C] transition-colors hover:bg-gray-50 sm:w-auto"
              >
                <FolderPlus size={16} />
                <span className="whitespace-nowrap">New Folder</span>
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {totalSelected > 0 ? (
            <>
              <button className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-300 px-4 py-2.5 text-sm text-[#3A3A3C] transition hover:bg-gray-100 sm:w-auto">
                Move
              </button>
              <button className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-300 px-4 py-2.5 text-sm text-[#3A3A3C] transition hover:bg-gray-100 sm:w-auto">
                Download
              </button>
              <button
                onClick={onDeleteSelected}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-white shadow-sm transition hover:bg-red-700 sm:w-auto"
              >
                <Trash2 size={16} />
                <span className="whitespace-nowrap">Delete</span>
              </button>
            </>
          ) : (
            <>
              <div className="relative w-full sm:w-96" ref={searchTypeRef}>
                <div
                  className="flex items-stretch overflow-hidden rounded-2xl border border-gray-300
                            focus-within:ring-2 focus-within:ring-[#4B67F5] focus-within:border-[#4B67F5]"
                >
                  <div className="flex items-center pl-3 pr-2 text-gray-400">
                    <Search size={16} />
                  </div>

                  <input
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && localSearch.trim().length >= 3) {
                        onSearchSubmit(localSearch.trim());
                      }
                    }}
                    placeholder="Search..."
                    className="w-full bg-transparent py-2.5 pr-3 focus:outline-none"
                  />

                  <button
                    disabled={!canSearch}
                    onClick={() => onSearchSubmit(localSearch.trim())}
                    className={`px-4 border-l border-gray-300 transition ${
                      localSearch.trim().length < 3
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#4B67F5] text-white hover:bg-blue-600'
                    }`}
                  >
                    Search
                  </button>

                  <button
                    disabled={!canSearch}
                    onClick={() => setOpenSearchType(v => !v)}
                    className="flex items-center gap-2 border-l border-gray-300 bg-white px-3 text-sm hover:bg-gray-50"
                  >
                    {searchMode === 'all' && 'All'}
                    {searchMode === 'files' && 'Files'}
                    {searchMode === 'folders' && 'Folders'}
                  </button>
                </div>

                {openSearchType && (
                  <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-2xl border bg-white p-2 text-sm shadow-lg">
                    <button
                      className="block w-full rounded-xl px-2 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        if (!canSearch) return;
                        onSearchModeChange('all');
                        setOpenSearchType(false);
                      }}
                    >
                      All
                    </button>

                    <button
                      className="block w-full rounded-xl px-2 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        if (!canSearch) return;
                        onSearchModeChange('files');
                        setOpenSearchType(false);
                      }}
                    >
                      Files
                    </button>

                    <button
                      className="block w-full rounded-xl px-2 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        if (!canSearch) return;
                        onSearchModeChange('folders');
                        setOpenSearchType(false);
                      }}
                    >
                      Folders
                    </button>
                  </div>
                )}
              </div>

              <div className="inline-flex overflow-hidden rounded-2xl border border-gray-300 bg-white">
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`inline-flex items-center justify-center px-3 py-2.5 transition ${
                    viewMode === 'list'
                      ? 'bg-[#4B67F5] text-white'
                      : 'text-[#3A3A3C] hover:bg-gray-100'
                  }`}
                  title="List view"
                >
                  <List size={16} />
                </button>

                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`inline-flex items-center justify-center px-3 py-2.5 transition ${
                    viewMode === 'grid'
                      ? 'bg-[#4B67F5] text-white'
                      : 'text-[#3A3A3C] hover:bg-gray-100'
                  }`}
                  title="Grid view"
                >
                  <Grid size={16} />
                </button>
              </div>

              <div className="relative" ref={sortRef}>
                <button
                  className="inline-flex items-center justify-center rounded-2xl border border-gray-300 px-3 py-2.5 text-[#3A3A3C] transition hover:bg-gray-100 hover:text-blue-600"
                  onClick={() => setOpenSort(v => !v)}
                  title="Sort"
                >
                  <SortAsc
                    size={16}
                    className={`transition-transform ${openSort ? "rotate-180" : ""}`}
                  />
                </button>

                {openSort && (
                  <div className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border bg-white p-2 text-sm shadow-lg">
                    <div className="mb-2 px-2 font-medium text-gray-600">Sort by</div>

                    <button
                      className="block w-full rounded-xl px-2 py-2 text-left hover:bg-gray-100"
                      onClick={() => onSortChange('name', sortDirection === 'asc' ? 'desc' : 'asc')}
                    >
                      Name {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </button>

                    <button
                      className="block w-full rounded-xl px-2 py-2 text-left hover:bg-gray-100"
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
    </div>
  );
};

export default ActionBar;