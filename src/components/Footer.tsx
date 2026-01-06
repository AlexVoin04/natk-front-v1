import React from 'react';
import { ShieldCheck } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 px-6 mt-auto">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-6">
          <span>© 2025 Stratus.</span>
          <a href="#" className="hover:text-[#4B67F5] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#4B67F5] transition-colors">Terms of Service</a>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <ShieldCheck size={20} className="text-green-500" />
          <span>
            Files are scanned with 
            <span className="font-medium text-gray-500">
              <a 
                rel="nofollow" 
                target="_blank" 
                href="https://www.clamav.net/documents"
                className="ml-1 text-[#4B67F5] hover:underline"
              >
                ClamAV
              </a>
            </span>
          </span>
        </div>
        <div className="flex items-center hidden">
          <span>Built with ❤️ by </span>
          <a 
            rel="nofollow" 
            target="_blank" 
            href="https://github.com/AlexVoin04"
            className="ml-1 text-[#4B67F5] hover:underline"
          >
            AlexVoin04
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;