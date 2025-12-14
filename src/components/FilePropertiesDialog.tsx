import React from "react";
import { X, FileText, File } from "lucide-react";
import { format } from "date-fns";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: any | null;
}

const safeDate = (d?: string | null) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return format(date, "dd.MM.yyyy HH:mm");
};

const formatSize = (bytes?: number) => {
  if (!bytes || bytes < 0) return "—";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let value = bytes;

  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }

  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

const FilePropertiesDialog: React.FC<Props> = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-white rounded-2xl w-full max-w-md p-0 shadow-2xl animate-[fadeIn_0.15s_ease-out]"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#3A3A3C]">
            File properties
          </h2>

          <button
            className="p-2 hover:bg-gray-100 rounded-xl transition"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* File Icon */}
        <div className="flex flex-col items-center py-5">
          <div className="p-3 bg-gray-100 rounded-2xl shadow-inner">
            {file.icon ?? <File size={40} className="text-gray-500" />}
          </div>

          <div className="mt-3 text-base font-medium text-[#3A3A3C] text-center px-4 truncate">
            {file.name}
          </div>
          <div className="text-sm text-gray-500">{formatSize(file.fileSize)}</div>
        </div>

        {/* Properties List */}
        <div className="px-6 pb-6 space-y-4">
          <div className="border rounded-xl overflow-hidden">
            <div className="divide-y">
              <div className="flex justify-between px-4 py-2 bg-gray-50">
                <span className="text-gray-500">Type</span>
                <span className="font-medium break-all max-w-[210px] text-right" title={file.fileType}>{file.fileType}</span>
              </div>

              <div className="flex justify-between px-4 py-2">
                <span className="text-gray-500">Path</span>
                <span className="font-medium truncate max-w-[200px] text-right">{file.path}</span>
              </div>

              <div className="flex justify-between px-4 py-2 bg-gray-50">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">{safeDate(file.createdAt)}</span>
              </div>

              <div className="flex justify-between px-4 py-2">
                <span className="text-gray-500">Deleted</span>
                <span className="font-medium">{file.isDeleted ? "Yes" : "No"}</span>
              </div>

              {file.deletedAt && (
                <div className="flex justify-between px-4 py-2 bg-gray-50">
                  <span className="text-gray-500">Deleted at</span>
                  <span className="font-medium">{safeDate(file.deletedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#4B67F5] text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default FilePropertiesDialog;
