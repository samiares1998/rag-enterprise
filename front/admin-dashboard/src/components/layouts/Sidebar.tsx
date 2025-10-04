import { useState, type JSX } from "react";
import { LayoutDashboard, MessageSquare, FileText, Database, Link2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type NavItem = {
  name: string;
  path: string;
  icon: JSX.Element;
};

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Chat", path: "/chat", icon: <MessageSquare size={20} /> },
  { name: "Documents", path: "/documents", icon: <FileText size={20} /> },
  { name: "Data Bases", path: "/databases", icon: <Database size={20} /> },
  { name: "Conexions", path: "/conexions", icon: <Link2 size={20} /> },
];

export default function Sidebar() {
  const [isOpen] = useState(true); // fijo abierto
  const location = useLocation();

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="p-6 text-xl font-bold text-blue-600">NEURORAG.AI</div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                active
                  ? "bg-blue-100 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
