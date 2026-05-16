import React, { useState } from "react";
import { X, File, Copy, Check } from "lucide-react";
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

type ScanStatus =
  | "UPLOADED_PENDING_SCAN"
  | "SCANNING"
  | "READY"
  | "INFECTED"
  | "ERROR";

const STATUS_META: Record<
  ScanStatus,
  { label: string; className: string }
> = {
  UPLOADED_PENDING_SCAN: {
    label: "Pending scan",
    className: "bg-gray-100 text-gray-600",
  },
  SCANNING: {
    label: "Scanning",
    className: "bg-blue-100 text-blue-700 animate-pulse",
  },
  READY: {
    label: "Safe",
    className: "bg-green-100 text-green-700",
  },
  INFECTED: {
    label: "Infected",
    className: "bg-red-100 text-red-700",
  },
  ERROR: {
    label: "Scan error",
    className: "bg-orange-100 text-orange-700",
  },
};

const getStatusMeta = (status?: ScanStatus) =>
  status ? STATUS_META[status] : null;


const FilePropertiesDialog: React.FC<Props> = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  const statusMeta = getStatusMeta(file.status as ScanStatus);

  const [copied, setCopied] = useState(false);

  const handleCopyName = async () => {
    try {
      await navigator.clipboard.writeText(file.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

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

          <div className="mt-3 w-full px-4 min-w-0">
            <div className="flex items-center gap-2">
              <div
                className="flex-1 min-w-0 text-base font-medium text-[#3A3A3C] truncate"
                title={file.name}
              >
                {file.name}
              </div>

              <button
                onClick={handleCopyName}
                className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition"
                title="Copy name"
              >
                {copied ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} className="text-gray-500" />
                )}
              </button>
            </div>
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

              {statusMeta && (
                <div className="flex justify-between px-4 py-2">
                  <span className="text-gray-500">Scan status</span>
                  <span
                    className={`inline-flex items-center justify-center px-2.5 h-6 text-xs font-medium rounded-full ${statusMeta.className}`}
                  >
                    {statusMeta.label}
                  </span>
                </div>
              )}

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
