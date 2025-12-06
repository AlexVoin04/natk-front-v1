import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  id: string | null;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onClick?: (id: string | null) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onClick }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-[#3A3A3C] mb-4">
      {items.map((item, index) => (
        <React.Fragment key={item.id ?? index}>
          {index > 0 && <span className="text-gray-400">/</span>}
          <button
            className={`hover:text-[#4B67F5] transition-colors ${
              index === items.length - 1 ? 'font-medium text-[#4B67F5]' : ''
            }`}
            onClick={() => onClick?.(item.id)}
          >
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;