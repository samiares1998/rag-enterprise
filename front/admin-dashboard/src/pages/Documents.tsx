import DocumentsTable, { type Document } from "../components/documents/DocumentsTable";

const docs: Document[] = [
  {
    id: "68cad30af27def66ce73d44b",
    filename: "CV_Sami_Yahir_Arevalo_Cambridge.pdf",
    content_type: "local-file",
    upload_date: "2025-09-17T15:26:02.096+00:00",
    path: "data/raw/CV_Sami_Yahir_Arevalo_Cambridge.pdf",
  },
  {
    id: "90cad30af27def66ce73d111",
    filename: "financial_report_q1.pdf",
    content_type: "local-file",
    upload_date: "2025-08-01T10:15:22.000+00:00",
    path: "data/raw/financial_report_q1.pdf",
  },
];

export default function Documents() {
  const handleView = (doc: Document) => {
    alert(`Viewing document: ${doc.filename}`);
  };

  const handleEdit = (doc: Document) => {
    alert(`Editing document: ${doc.filename}`);
  };

  const handleDelete = (doc: Document) => {
    if (confirm(`Are you sure you want to delete ${doc.filename}?`)) {
      alert(`Deleted: ${doc.filename}`);
    }
  };

  return (
    <DocumentsTable
      documents={docs}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
