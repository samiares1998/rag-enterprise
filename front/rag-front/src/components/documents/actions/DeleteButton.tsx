import React from "react";

interface DeleteButtonProps {
  id: number;
  onDelete?: (id: number) => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ id, onDelete }) => {
  const handleDelete = async () => {
    if (onDelete) {
      onDelete(id);
    } else {
      try {
        await fetch(`http://localhost:8000/api/v1/ingestion/files/${id}`, {
          method: "DELETE",
        });
        alert("Documento eliminado");
      } catch (err) {
        console.error("Error eliminando documento:", err);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Eliminar
    </button>
  );
};

export default DeleteButton;
