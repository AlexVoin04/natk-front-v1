import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-[#3A3A3C] mb-4">
      <button className="flex items-center hover:text-[#4B67F5] transition-colors">
        <Home size={16} className="mr-1" />
        <span>Home</span>
      </button>
      
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          <ChevronRight size={16} className="text-gray-400" />
          <button
            className={`hover:text-[#4B67F5] transition-colors ${
              index === items.length - 1 ? 'font-medium text-[#4B67F5]' : ''
            }`}
          >
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;