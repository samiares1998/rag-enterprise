import Modal from "../ui/ModalDocument";
import type { Document } from "../../types/Index";

type ViewDocumentProps = {
  documentRaw: Document;
  isOpen: boolean;
  onClose: () => void;
};

export default function ViewDocument({
  documentRaw,
  isOpen,
  onClose,
}: ViewDocumentProps) {
  // 🔹 Quitar /front/admin-dashboard para obtener la ruta limpia
  const fileUrl = documentRaw.path_original.replace(
    /^\/?front\/admin-dashboard/,
    ""
  );

  // Extraer extensión si no tienes mime_type
  const ext = documentRaw.filename.split(".").pop()?.toLowerCase() || "";

  const renderPreview = () => {
    if (ext === "pdf") {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-[70vh] rounded-lg border"
          title="PDF Viewer"
        />
      );
    }

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return (
        <img
          src={fileUrl}
          alt={documentRaw.filename}
          className="max-h-[70vh] mx-auto rounded-lg shadow"
        />
      );
    }

    if (["txt", "md", "csv", "json"].includes(ext)) {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-[70vh] rounded-lg border bg-white"
          title="Text Viewer"
        />
      );
    }

    if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            window.location.origin + fileUrl
          )}`}
          className="w-full h-[70vh] rounded-lg border"
          title="Office Viewer"
        />
      );
    }

    return (
      <div className="text-center text-gray-600 space-y-3">
        <p>❌ No preview available for <b>{documentRaw.filename}</b></p>
        <a
          href={fileUrl}
          download
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow"
        >
          ⬇️ Download File
        </a>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`📄 Viewing: ${documentRaw.filename}`}
      onClose={onClose}
      size="xl" // 🔹 usa el modal grande
    >
      <div className="space-y-5">
        {/* Preview */}
        {renderPreview()}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
