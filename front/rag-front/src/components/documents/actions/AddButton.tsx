import React, { useRef } from "react";

interface AddButtonProps {
  onAdd?: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ onAdd }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      const formData = new FormData();
      formData.append("file", file);

      try {
        await fetch("http://localhost:8000/api/v1/ingestion/files", {
          method: "POST",
          body: formData,
        });
        alert("Documento añadido");
        if (onAdd) onAdd();
      } catch (err) {
        console.error("Error subiendo documento:", err);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Añadir documento
      </button>
    </>
  );
};

export default AddButton;
