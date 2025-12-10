import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Edit, Trash2, Copy, Move, Info } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  item: {
    id: string;
    type: "folder" | "file";
  } | null;
  onDownload: (id: string) => void;
  onProperties: (id: string) => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  item,
  onDownload,
  onProperties,
  onClose
}) => {
  const [pos, setPos] = useState({ x, y });

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
      {/* прозрачный слой для клика вне меню */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* само меню */}
      <div
        className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-48 
                   animate-[fadeIn_0.12s_ease-out] 
                   transition-opacity duration-200"
        style={{ left: pos.x, top: pos.y }}
      >
        {/* Кнопки */}
        <MenuItem
          disabled={isFolder}
          icon={<Download size={16} />}
          label="Download"
          onClick={() => !isFolder && onDownload(item.id)}
        />

        <MenuItem
          icon={<Edit size={16} />}
          label="Rename"
        />

        <MenuItem
          disabled={isFolder}
          icon={<Copy size={16} />}
          label="Copy"
        />

        <MenuItem
          icon={<Move size={16} />}
          label="Move"
        />

        <MenuItem
          disabled={isFolder}
          icon={<Info size={16} />}
          label="Properties"
          onClick={() => !isFolder && onProperties(item.id)}
        />

        <hr className="my-2 border-gray-200" />

        <MenuItem
          icon={<Trash2 size={16} />}
          label="Delete"
          danger
        />
      </div>

      {/* Анимация */}
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
  danger
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
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