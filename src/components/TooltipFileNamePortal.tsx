import { createPortal } from "react-dom";
import React, { useEffect, useState, useRef } from "react";

interface TooltipFileNamePortalProps {
  targetRect: DOMRect;
  children: React.ReactNode;
  delay?: number;
}

const TooltipFileNamePortal: React.FC<TooltipFileNamePortalProps> = ({
  targetRect,
  children,
  delay = 600,
}) => {
  const [visible, setVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Показ с задержкой
  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [targetRect, delay]);

  // Корректировка позиции по ширине и границам экрана
  useEffect(() => {
    if (!tooltipRef.current) return;

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl.offsetWidth;
    const tooltipHeight = tooltipEl.offsetHeight;

    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    let top = targetRect.top - tooltipHeight - 8; // 8px отступ сверху

    // Проверяем границы окна
    const padding = 8; // отступ от краев
    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding)
      left = window.innerWidth - tooltipWidth - padding;
    if (top < padding) top = targetRect.bottom + 8; // если не помещается сверху, показываем снизу

    setTooltipStyle({
      top: `${top}px`,
      left: `${left}px`,
    });
  }, [targetRect, visible]);

  if (!visible) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      style={{
        position: "fixed",
        zIndex: 9999,
        pointerEvents: "none",
        ...tooltipStyle,
      }}
      className="bg-black text-white text-xs py-1 px-2 rounded-lg shadow-lg whitespace-nowrap transition-opacity duration-150"
    >
      {children}
    </div>,
    document.body
  );
};

export default TooltipFileNamePortal;
