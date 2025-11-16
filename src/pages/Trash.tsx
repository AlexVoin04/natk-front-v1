import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Trash2, RotateCcw, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface TrashItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  deletedAt: Date;
  originalPath: string;
}

const mockTrashItems: TrashItem[] = [
  {
    id: '1',
    name: 'Old Project.zip',
    type: 'file',
    deletedAt: new Date('2024-11-30'),
    originalPath: '/Documents/Projects'
  },
  {
    id: '2',
    name: 'Temp Folder',
    type: 'folder',
    deletedAt: new Date('2024-11-28'),
    originalPath: '/Downloads'
  },
  {
    id: '3',
    name: 'Screenshot.png',
    type: 'file',
    deletedAt: new Date('2024-11-25'),
    originalPath: '/Images'
  }
];

const Trash: React.FC = () => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>(mockTrashItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleRestore = (itemId: string) => {
    const item = trashItems.find(i => i.id === itemId);
    if (item) {
      setTrashItems(prev => prev.filter(i => i.id !== itemId));
      toast.success(`"${item.name}" restored successfully`);
    }
  };

  const handlePermanentDelete = (itemId: string) => {
    const item = trashItems.find(i => i.id === itemId);
    if (item) {
      setTrashItems(prev => prev.filter(i => i.id !== itemId));
      toast.success(`"${item.name}" permanently deleted`);
    }
  };

  const handleEmptyTrash = () => {
    setTrashItems([]);
    toast.success('Trash emptied successfully');
  };

  const handleItemSelect = (itemId: string, e: React.MouseEvent) => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trash2 size={24} className="text-[#3A3A3C]" />
              <h1 className="text-2xl font-semibold text-[#3A3A3C]">Trash</h1>
              <span className="text-sm text-gray-500">({trashItems.length} items)</span>
            </div>
            
            {trashItems.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Empty Trash
              </button>
            )}
          </div>

          {trashItems.length === 0 ? (
            <div className="text-center py-16">
              <Trash2 size={64} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-medium text-[#3A3A3C] mb-2">Trash is empty</h2>
              <p className="text-gray-500">Items you delete will appear here</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#EDEDED] border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-[#3A3A3C] text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-[#3A3A3C] text-sm">Original Location</th>
                      <th className="text-left py-3 px-4 font-medium text-[#3A3A3C] text-sm">Deleted</th>
                      <th className="text-right py-3 px-4 font-medium text-[#3A3A3C] text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trashItems.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedItems.includes(item.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={(e) => handleItemSelect(item.id, e)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            {item.type === 'folder' ? (
                              <div className="w-5 h-5 bg-[#4B67F5] rounded opacity-50" />
                            ) : (
                              <div className="w-5 h-5 bg-gray-400 rounded opacity-50" />
                            )}
                            <span className="text-[#3A3A3C] font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#3A3A3C] text-sm">
                          {item.originalPath}
                        </td>
                        <td className="py-3 px-4 text-[#3A3A3C] text-sm">
                          {format(item.deletedAt, 'MMM dd, yyyy HH:mm')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(item.id);
                              }}
                              className="p-2 text-[#4B67F5] hover:bg-blue-100 rounded-lg transition-colors"
                              title="Restore"
                            >
                              <RotateCcw size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePermanentDelete(item.id);
                              }}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete permanently"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Trash;