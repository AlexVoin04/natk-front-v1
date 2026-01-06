import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchFileForViewer, downloadFile } from '../services/storage';

interface FileViewerProps {
  fileId: string;
  onClose: () => void;
}

type LoadedFile = {
  uri: string;
  fileName: string;
  contentType?: string;
};

const AppFileViewer: React.FC<FileViewerProps> = ({ fileId, onClose }) => {
  const [file, setFile] = useState<LoadedFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;
    let mounted = true;

    const loadFile = async () => {
      setLoading(true);
      try {
        const { objectUrl: url, fileName, contentType } = await fetchFileForViewer(fileId);
        objectUrl = url;

        if (!mounted) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        setFile({ uri: objectUrl, fileName, contentType });
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || 'Не удалось открыть файл');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadFile();

    return () => {
      mounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <p className="bg-white p-4 rounded shadow-lg animate-pulse">Загрузка...</p>
      </div>
    );
  }

  if (!file) return null;

  const { uri, fileName, contentType } = file;
  const ext = (fileName.split('.').pop() || '').toLowerCase();

  const isPdf =
    (contentType && contentType.toLowerCase().includes('application/pdf')) || ext === 'pdf';
  const isImage =
    contentType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  const isOffice =
    [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ].some((t) => contentType?.includes(t)) ||
    ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);

  const handleDownload = async () => {
    try {
      await downloadFile(fileId);
    } catch {
      // downloadFile сам покажет toast
    }
  };

  const renderBody = () => {
    if (isOffice) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <p className="mb-4 text-gray-700">
            This file type cannot be viewed online yet. Download it to view it in the Office application.
          </p>
          <button
            onClick={handleDownload}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Download
          </button>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="w-full h-full p-2">
          <iframe
            src={uri}
            title={fileName}
            className="w-full h-full border rounded-md shadow-inner"
          />
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
          <img
            src={uri}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-md shadow-lg"
          />
        </div>
      );
    }

    // Fallback для остальных типов
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
        <p className="mb-4 text-gray-700">
          Online viewing is not configured for this file type. You can download it.
        </p>
        <button
          onClick={handleDownload}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Download
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-4xl h-full max-h-[85vh] rounded-lg shadow-2xl overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b">
          <h3 className="text-lg font-semibold truncate">{fileName}</h3>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-xl font-bold px-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-white">{renderBody()}</div>
      </div>
    </div>
  );
};

export default AppFileViewer;