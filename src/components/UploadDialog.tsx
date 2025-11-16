import React, { useState, useRef } from 'react';
import { X, Upload, File, Image, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

const UploadDialog: React.FC<UploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startUpload = () => {
    const files = uploadFiles.map(uf => uf.file);
    onUpload(files);
    
    // Simulate upload progress
    uploadFiles.forEach((_, index) => {
      setUploadFiles(prev => 
        prev.map((uf, i) => 
          i === index ? { ...uf, status: 'uploading' } : uf
        )
      );

      const interval = setInterval(() => {
        setUploadFiles(prev => 
          prev.map((uf, i) => {
            if (i === index) {
              const newProgress = Math.min(uf.progress + 10, 100);
              return {
                ...uf,
                progress: newProgress,
                status: newProgress === 100 ? 'completed' : 'uploading'
              };
            }
            return uf;
          })
        );
      }, 200);

      setTimeout(() => clearInterval(interval), 2000);
    });
  };

  const handleClose = () => {
    setUploadFiles([]);
    onClose();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image size={20} className="text-green-500" />;
    }
    return <File size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Upload size={20} className="text-[#4B67F5]" />
                <h2 className="text-lg font-semibold text-[#3A3A3C]">Upload Files</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-[#3A3A3C]" />
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center mb-4 transition-colors ${
                isDragOver 
                  ? 'border-[#4B67F5] bg-blue-50' 
                  : 'border-gray-300 hover:border-[#4B67F5]'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-[#3A3A3C] mb-2">
                Drag and drop files here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#4B67F5] hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Support for multiple files up to 100MB each
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            {uploadFiles.length > 0 && (
              <div className="flex-1 overflow-y-auto mb-4">
                <h3 className="font-medium text-[#3A3A3C] mb-2">Files to upload:</h3>
                <div className="space-y-2">
                  {uploadFiles.map((uploadFile, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      {getFileIcon(uploadFile.file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3A3A3C] truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                        {uploadFile.status === 'uploading' && (
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div
                              className="bg-[#4B67F5] h-1 rounded-full transition-all duration-300"
                              style={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      {uploadFile.status === 'completed' ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <X size={16} className="text-[#3A3A3C]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-[#3A3A3C] hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startUpload}
                disabled={uploadFiles.length === 0}
                className="px-4 py-2 bg-[#4B67F5] text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload {uploadFiles.length} {uploadFiles.length === 1 ? 'File' : 'Files'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadDialog;