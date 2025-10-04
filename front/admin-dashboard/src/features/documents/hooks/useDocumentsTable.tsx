import { useState } from 'react';
import type { Document } from '../types/Index';

//-----------LOGICA DE NEGOCIO O CONOCIDA COMO HOOKS DONDE MODIFICO EL COMPORTAMIENTO DE CADA COMPONENTE ----

export const useDocumentsTable = () => {

  //DEFINO TODAS LAS CONSTANTES Y ESTADOS QUE VAN A TOMAR 

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [search, setSearch] = useState("");

  //DEFINO CADA CONSTANTES DE LOS MODALES - COMO SE VAN A MOSTRAR EN SUS ESTADOS INICIALES 
  const openEditModal = (doc: Document) => {
    setSelectedDoc(doc);
    setIsEditOpen(true);
  };

  const openViewModal = (doc: Document) => {
    setSelectedDoc(doc);
    setIsViewOpen(true);
  };

  const openAddModal = () => {
    setIsAddOpen(true);
  };

  const closeModals = () => {
    setIsEditOpen(false);
    setIsViewOpen(false);
    setIsAddOpen(false);
    setSelectedDoc(null);
  };

  //CONSTANTE PARA FILTRAR DOCUMENTOS 

  const filterDocuments = (documents: Document[]) => {
    return documents.filter(
      (doc) =>
        doc.filename.toLowerCase().includes(search.toLowerCase()) ||
        doc._id.toLowerCase().includes(search.toLowerCase())
    );
  };


  // RETORNO CADA UNA DE ELLAS PARA QUE EL COMPONENTE PRINCIPAL PUEDA USARLAS SIN TENER QUE DEFINIRLAS EN LA CLASE 
  return {
    // State
    isEditOpen,
    isViewOpen,
    isAddOpen,
    selectedDoc,
    search,
    
    // Actions
    setSearch,
    openEditModal,
    openViewModal,
    openAddModal,
    closeModals,
    
    // Derived state
    filterDocuments
  };
};