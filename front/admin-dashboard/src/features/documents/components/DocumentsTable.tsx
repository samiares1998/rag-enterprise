import { Plus, } from "lucide-react";
import type { AddNewDocument, Document, DocumentEdit } from '../types/Index';
import AddDocument from "./AddDocument";
import EditDocument from "./EditDocument";
import ViewDocument from "./ViewDocument";
import DocumentsTableHeader from "./DocumentsTableHeader";
import DocumentsTableBody from "./DocumentsTableBody";
import SearchInput from "./SearchInput";
import { useDocumentsTable } from "../hooks/useDocumentsTable"


//---------------ACCIONES QUE TENDRA LA TABLA ---------------------------
type DocumentsTableProps = {
  documents: Document[];
  onEdit?: (doc: DocumentEdit, id: string) => void;
  onDelete?: (doc: Document, path: string) => void;
  onAdd?: (doc: Omit<AddNewDocument, "_id">) => void;
};

//--------------------------------------------------------------------------
export default function DocumentsTable({
  documents,
  onEdit,
  onDelete,
  onAdd,
}: DocumentsTableProps) {


  //------CONSTANTES UTILES PARA USAR LOS DEMAS COMPONENTES-------------------
  const {
    isEditOpen,
    isViewOpen,
    isAddOpen,
    selectedDoc,
    search,
    setSearch,
    openEditModal,
    openViewModal,
    openAddModal,
    closeModals,
    filterDocuments
  } = useDocumentsTable();


  //------------constante encargada del filtrado del documento-------------------------------------------------------------

  const filteredDocs = filterDocuments(documents);

  //--------constante para menejar el modal de añadir-----------------------------------------------------------------

  const handleAdd = (doc: Omit<AddNewDocument, "_id">) => {
    onAdd?.(doc);
    closeModals();
  };

  //--------constante para menejar el modal de editar-----------------------------------------------------------------

  const handleEdit = (updatedDoc: DocumentEdit, id: string) => {
    onEdit?.(updatedDoc, id);
    closeModals();
  };

  //--------html que llamara los demas componentes y mostrara una sola vista-----------------------------------------------------------------

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* PRIMERO SE LLAMA AL HEADER DE AÑADIR DOCUMENTO */}
      <DocumentsTableHeader onAddClick={openAddModal} />

      {/* COMPONENTE PARA BUSCAR POR NOMBRE DE ARCHIVO O ID */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by filename or ID..."
      />

      {/* COMPONENTE QUE MUESTRA LA TABLA POR ESO LE PASAMOS LOS DOCUMENTOS Y LAS FUNCIONES */}
      <DocumentsTableBody
        documents={filteredDocs}
        onView={openViewModal}
        onEdit={openEditModal}
        onDelete={onDelete}
      />

      {/* BOTON DE AÑADIR */}
      <div className="flex justify-end mt-4">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Document
        </button>
      </div>

      {/* MODALES QUE SOLO SE ACTIVAN CUANDO SE DE CLICK */}
      <AddDocument
        isOpen={isAddOpen}
        onClose={closeModals}
        onSave={handleAdd}
      />

      {selectedDoc && (
        <EditDocument
          documentRaw={selectedDoc}
          isOpen={isEditOpen}
          onClose={closeModals}
          onEdit={(updatedDoc) => handleEdit(updatedDoc, selectedDoc._id)}
        />
      )}

      {selectedDoc && (
        <ViewDocument
          documentRaw={selectedDoc}
          isOpen={isViewOpen}
          onClose={closeModals}
        />
      )}
    </div>
  );


  //-----------------------------------------------------------------------------------------

}