import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Edit, Trash2, Copy, Move, Info } from "lucide-react";


interface ContextMenuItem {
  id: string;
  type: "folder" | "file";
  name: string;
}

interface ContextMenuProps {
  x: number;
  y: number;
  item: ContextMenuItem | null;
  onDownload: (id: string) => void;
  onProperties: (id: string) => void;
  onRename: (item: ContextMenuItem) => void;
  onCopy: (id: string) => void;
  onClose: () => void;
  onDelete: (item: { id: string; type: "folder" | "file" }) => void;
  onMove: (item: ContextMenuItem) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  item,
  onDownload,
  onProperties,
  onRename,
  onCopy,
  onClose,
  onDelete,
  onMove
}) => {
  const [pos, setPos] = useState({ x, y });
  const [confirmOpen, setConfirmOpen] = useState(false);

  // авто-позиционирование (чтобы меню не улетало за экран)
  useEffect(() => {
    const menuWidth = 200;
    const menuHeight = 260;
    const padding = 10;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    let finalX = x;
    let finalY = y;

    if (x + menuWidth > screenW - padding) {
      finalX = screenW - menuWidth - padding;
    }
    if (y + menuHeight > screenH - padding) {
      finalY = screenH - menuHeight - padding;
    }

    setPos({ x: finalX, y: finalY });
  }, [x, y]);

  if (!item) return null;

  const isFolder = item.type === "folder";

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <div
        className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-48 
                   animate-[fadeIn_0.12s_ease-out] 
                   transition-opacity duration-200"
        style={{ left: pos.x, top: pos.y }}
      >
        <MenuItem
          disabled={isFolder}
          icon={<Download size={16} />}
          label="Download"
          onClick={() => !isFolder && onDownload(item.id)}
          onClose={onClose}
        />

        <MenuItem
          icon={<Edit size={16} />}
          label="Rename"
          onClick={() => onRename(item)}
          onClose={onClose}
        />

        <MenuItem
          disabled={isFolder}
          icon={<Copy size={16} />}
          label="Copy"
          onClick={() => !isFolder && onCopy(item.id)}
          onClose={onClose}
        />

        <MenuItem
          icon={<Move size={16} />}
          label="Move"
          onClick={() => {
            if (item) onMove(item);
          }}
          onClose={onClose}
        />

        <MenuItem
          disabled={isFolder}
          icon={<Info size={16} />}
          label="Properties"
          onClose={onClose}
          onClick={() => !isFolder && onProperties(item.id)}
        />

        <hr className="my-2 border-gray-200" />

        <MenuItem
          icon={<Trash2 size={16} />}
          label="Delete"
          danger
          closeOnClick={false}
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
        />
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(item);
                  setConfirmOpen(false);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.94); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>,
    document.body
  );
};

export default ContextMenu;

// Компонент кнопки меню
const MenuItem = ({
  icon,
  label,
  onClick,
  disabled,
  danger,
  onClose,
  closeOnClick = true
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  danger?: boolean;
  onClose?: () => void;
  closeOnClick?: boolean;
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        if (closeOnClick) {
          onClose?.();
        }
      }}
      disabled={disabled}
      className={`
        w-full text-left px-4 py-2 flex items-center space-x-2 text-sm
        transition-colors rounded-md mx-1
        ${disabled
          ? "text-gray-400 cursor-not-allowed"
          : danger
            ? "text-red-500 hover:bg-red-50 active:bg-red-100"
            : "text-[#3A3A3C] hover:bg-gray-100 active:bg-gray-200"
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};