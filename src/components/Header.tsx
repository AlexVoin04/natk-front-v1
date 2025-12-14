import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[#4B67F5] rounded-lg flex items-center justify-center">
            <div className="text-white font-bold text-sm">
              <img src='/logo.svg'></img>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-[#3A3A3C]">Stratus</h1>
        </Link>
        
        {/* <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-[#3A3A3C] hover:text-[#4B67F5] transition-colors">
            Storage
          </Link>
          <Link to="/trash" className="text-[#3A3A3C] hover:text-[#4B67F5] transition-colors">
            Trash
          </Link>
        </nav> */}

        <div className="flex items-center space-x-4">
          <span className="text-sm text-[#3A3A3C] hidden sm:block">
            Welcome, {user?.name}
          </span>
          <button className="p-2 text-[#3A3A3C] hover:text-[#4B67F5] hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={20} />
          </button>
          <Link to="/profile" className="text-[#3A3A3C] hover:text-[#4B67F5] transition-colors">
                      <button className="p-2 text-[#3A3A3C] hover:text-[#4B67F5] hover:bg-gray-100 rounded-lg transition-colors">
          <User size={20} />
          </button>
          </Link>
          <button 
            onClick={handleLogout}
            className="p-2 text-[#3A3A3C] hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;