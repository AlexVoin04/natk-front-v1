import { createPortal } from "react-dom";
import React from "react";

interface TooltipFileNamePortalProps {
  targetRect: DOMRect;
  children: React.ReactNode;
}

const TooltipFileNamePortal: React.FC<TooltipFileNamePortalProps> = ({ targetRect, children }) => {
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: targetRect.top - 8,
        left: targetRect.left + targetRect.width / 2,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
        pointerEvents: "none"
      }}
      className="bg-black text-white text-xs py-1 px-2 rounded-lg shadow-lg whitespace-nowrap"
    >
      {children}
    </div>,
    document.body
  );
};

export default TooltipFileNamePortal;