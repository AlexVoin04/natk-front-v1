import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Trash2, RotateCcw, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fetchTrashItems, type TrashItemDto, restoreTrashItem } from "../services/trash";
import CopyFileDialog from '../components/CopyFileDialog';

const Trash: React.FC = () => {
  const [trashItems, setTrashItems] = useState<TrashItemDto[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<TrashItemDto | null>(null);
  const [folderTreeVersion, setFolderTreeVersion] = useState(0);

  useEffect(() => {
    loadTrash();
  }, []);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const items = await fetchTrashItems();
      setTrashItems(items);
    } catch (e) {
      toast.error("Ошибка загрузки корзины");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (item: TrashItemDto) => {
    setRestoreTarget(item);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = async (targetFolderId: string | null) => {
    if (!restoreTarget) return;

    try {
      await restoreTrashItem(restoreTarget, targetFolderId);

      toast.success(`"${restoreTarget.name}" восстановлен`);
      setTrashItems(prev => prev.filter(i => i.id !== restoreTarget.id));
    } catch (e) {
      toast.error("Не удалось восстановить элемент");
    } finally {
      setRestoreDialogOpen(false);
      setRestoreTarget(null);
    }
  };

  const handlePermanentDelete = async (item: TrashItemDto) => {
    // TODO: реализовать удаление через API
    // const item = trashItems.find(i => i.id === itemId);
    // if (item) {
    //   setTrashItems(prev => prev.filter(i => i.id !== itemId));
    //   toast.success(`"${item.name}" permanently deleted`);
    // }
  };

  const handleEmptyTrash = async () => {
    for (const item of trashItems) {
      await handlePermanentDelete(item);
    }
    toast.success("Trash emptied successfully");
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

            {loading ? (
              <div className="text-center py-16 text-gray-500">Loading...</div>
            ) : trashItems.length === 0 ? (
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
                      {trashItems.map(item => (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedItems.includes(item.id) ? "bg-blue-50" : ""
                          }`}
                          onClick={e => handleItemSelect(item.id, e)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-5 h-5 rounded opacity-50 ${
                                  item.type === "folder" ? "bg-[#4B67F5]" : "bg-gray-400"
                                }`}
                              />
                              <span className="text-[#3A3A3C] font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#3A3A3C] text-sm">{item.path}</td>
                          <td className="py-3 px-4 text-[#3A3A3C] text-sm">
                            {format(new Date(item.deletedAt), "MMM dd, yyyy HH:mm")}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleRestore(item);
                                }}
                                className="p-2 text-[#4B67F5] hover:bg-blue-100 rounded-lg transition-colors"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handlePermanentDelete(item);
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

        <CopyFileDialog
          isOpen={restoreDialogOpen}
          onClose={() => setRestoreDialogOpen(false)}
          onConfirm={confirmRestore}
          onCreateFolder={() => {}}
          treeVersion={folderTreeVersion}
          mode="restore"
        />
      </div>
    );
  };

export default Trash;