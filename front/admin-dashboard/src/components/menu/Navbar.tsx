import React from "react";
import { Search, Bell, Info, Moon } from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Logo / Branding */}
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold text-indigo-600">HORIZON</span>
        <span className="text-gray-500 font-medium">FREE</span>
      </div>

      {/* Search bar */}
      <div className="flex-1 mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Icons + User */}
      <div className="flex items-center space-x-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Info className="h-5 w-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Moon className="h-5 w-5 text-gray-600" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 flex items-center justify-center bg-indigo-600 text-white font-bold rounded-full cursor-pointer">
          AP
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
