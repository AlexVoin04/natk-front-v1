import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#4B67F5] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">US</span>
          </div>
          <h1 className="text-xl font-semibold text-[#3A3A3C]">User Storage</h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-[#3A3A3C] hover:text-[#4B67F5] transition-colors">
            Storage
          </Link>
          <Link to="/trash" className="text-[#3A3A3C] hover:text-[#4B67F5] transition-colors">
            Trash
          </Link>
          <Link to="/profile" className="text-[#3A3A3C] hover:text-[#4B67F5] transition-colors">
            Profile
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-[#3A3A3C] hover:text-[#4B67F5] hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={20} />
          </button>
          <button className="p-2 text-[#3A3A3C] hover:text-[#4B67F5] hover:bg-gray-100 rounded-lg transition-colors">
            <User size={20} />
          </button>
          <button className="p-2 text-[#3A3A3C] hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;