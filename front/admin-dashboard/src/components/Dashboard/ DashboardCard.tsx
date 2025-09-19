import type { ReactNode } from "react";

type Props = {
    title: string;
    children?: ReactNode;
  };
  
  export default function DashboardCard({ title, children }: Props) {
    return (
      <div className="bg-white rounded-2xl shadow  p-4 flex flex-col h-full">
        {/* Header con handle */}
        <div className="drag-handle cursor-move  px-4 py-2 rounded-t-2xl">
        <div className="flex items-center justify-between">
        {title && <h1 >{title}</h1>}
        </div>
        </div>
  
        {/* Contenido */}
        <div className="flex-1 p-4">{children}</div>
      </div>

        

    );
  }