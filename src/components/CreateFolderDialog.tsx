import React, { useState } from 'react';
import { X, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }
    
    if (folderName.length > 255) {
      setError('Folder name is too long');
      return;
    }

    const result = await onConfirm(folderName.trim());

    if (result?.error) {
      setError(result.error);

      if (result.suggestedName) {
        setFolderName(result.suggestedName);
      }

      return;
    }

    setFolderName('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setFolderName('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Folder size={20} className="text-[#4B67F5]" />
                <h2 className="text-lg font-semibold text-[#3A3A3C]">Create New Folder</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-[#3A3A3C]" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="folderName" className="block text-sm font-medium text-[#3A3A3C] mb-2">
                  Folder Name
                </label>
                <input
                  id="folderName"
                  type="text"
                  value={folderName}
                  onChange={(e) => {
                    setFolderName(e.target.value);
                    setError('');
                  }}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5] focus:border-transparent ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter folder name"
                  autoFocus
                />
                {error && (
                  <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-[#3A3A3C] hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4B67F5] text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateFolderDialog;