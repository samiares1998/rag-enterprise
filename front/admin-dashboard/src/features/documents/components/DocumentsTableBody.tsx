import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Document } from '../types/Index';
//---------------------props usados en la vista de la tabla ------------------
type DocumentsTableBodyProps = {
  documents: Document[];
  onView: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onDelete?: (doc: Document, path: string) => void;
};

//----------------------------------------------------------------------------

export default function DocumentsTableBody({
  documents,
  onView,
  onEdit,
  onDelete,
}: DocumentsTableBodyProps) {

//--------------------cada componente tiene su logica, por ejemplo aca se valida que mostrar---------

  if (documents.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6">
        No documents found
      </div>
    );
  }
//--------------------se listan los documentos -------------------------------------------------
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-gray-500 text-sm">
            <th className="p-2">ID</th>
            <th className="p-2">Filename</th>
            <th className="p-2">Status</th>
            <th className="p-2">Upload Date</th>
            <th className="p-2">Comments</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <TableRow
              key={doc._id}
              document={doc}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// cada componente puede tener subcomponentes , esto para que sean facil de entender y testear 
function TableRow({ 
  document: doc, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  document: Document;
  onView: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onDelete?: (doc: Document, path: string) => void;
}) {
  return (
    <tr className="bg-gray-50 hover:bg-gray-100 rounded-lg">
      <td className="p-2 font-mono text-xs text-gray-700">
        {doc._id.slice(0, 8)}...
      </td>
      <td className="p-2 font-medium text-gray-900">
        {doc.filename}
      </td>
      <td className="p-2">
        <StatusBadge status={doc.status} />
      </td>
      <td className="p-2 text-gray-600">
        {new Date(doc.upload_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="p-2 text-gray-600 cursor-pointer">
        {doc.comments}
      </td>
      <td className="p-2 flex items-center justify-center gap-3">
        <ActionButton
          icon={<Eye size={18} />}
          color="blue"
          onClick={() => onView(doc)}
          tooltip="View document"
        />
        <ActionButton
          icon={<Pencil size={18} />}
          color="green"
          onClick={() => onEdit(doc)}
          tooltip="Edit document"
        />
        <ActionButton
          icon={<Trash2 size={18} />}
          color="red"
          onClick={() => onDelete?.(doc, doc.path_original)}
          tooltip="Delete document"
        />
      </td>
    </tr>
  );
}

// Componente para el badge de estado - opcional solo lo puse para que se vea con un color diferente
function StatusBadge({ status }: { status: string }) {
  const isProcessed = status === "processed";
  
  return (
    <span className={`p-2 capitalize rounded-lg ${
      isProcessed 
        ? "text-green-800 font-medium bg-green-100" 
        : "text-gray-600"
    }`}>
      {status}
    </span>
  );
}

// Componente reutilizable para botones de acción- opcional solo coloque toda la logica en un subcomponente 
function ActionButton({ 
  icon, 
  color, 
  onClick, 
  tooltip 
}: { 
  icon: React.ReactNode;
  color: "blue" | "green" | "red";
  onClick: () => void;
  tooltip: string;
}) {
  const colorClasses = {
    blue: "text-blue-500 hover:text-blue-700",
    green: "text-green-500 hover:text-green-700", 
    red: "text-red-500 hover:text-red-700"
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} transition-colors`}
      title={tooltip}
    >
      {icon}
    </button>
  );
}