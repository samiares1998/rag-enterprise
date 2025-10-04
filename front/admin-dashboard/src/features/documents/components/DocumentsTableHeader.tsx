import { MoreHorizontal } from "lucide-react";

type DocumentsTableHeaderProps = {
  onAddClick: () => void;
};

export default function DocumentsTableHeader({ onAddClick }: DocumentsTableHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-800">Documents</h2>
      <button className="p-2 hover:bg-gray-100 rounded-lg">
        <MoreHorizontal size={20} />
      </button>
    </div>
  );
}