import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/Sidebar"; 
import Navbar from "../layouts/Navbar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Contenedor principal */}
      <div className="flex flex-col flex-1">
        {/* Navbar arriba */}
        <Navbar />

        {/* Contenido */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* Aquí se renderizan las páginas */}
        </main>
      </div>
    </div>
  );
}
