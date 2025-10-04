import DocumentsTable from "../features/documents/components/DocumentsTable";
import { useDocuments } from "../features/documents/hooks/useDocuments";
import { useDocumentOperations } from "../features/documents/hooks/useDocumentOperations";

//--------PAGES PRINCIPAL EN EL CUAL DEFINO LAS FUNCIONES Y CONSTANTES QUE SE COMPARTIRAN---------------

export default function Documents() {
  const {
    documents,
    loading,
    error,
    refresh,
  } = useDocuments();

  //--------------------------------------------------------------------------

  const {
    handleEdit,
    handleDelete,
    handleAdd
  } = useDocumentOperations(refresh);

  //------------ESTOS IF SE PODRIAN CAMBIAR -------------------------------------------------------------- 

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

//  //--------------------------------------------------------------------------

  return (
    <DocumentsTable
      documents={documents}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
    />
  );

  //--------------------------------------------------------------------------
}