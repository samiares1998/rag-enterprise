import React from "react";
import { Document } from "../../../types/document";
import ModalPortal from "../../common/modalPortal";

interface ViewModalProps {
  doc: Document | null;
  onClose: () => void;
}


const ViewModal: React.FC<ViewModalProps> = ({ doc, onClose }) => {
  if (!doc) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-11/12 h-5/6 flex flex-col">
          <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {doc.filename}
            </h2>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <div className="flex-1">
            <iframe
              src={`http://localhost:5173/${doc.path}`}
              title={doc.filename}
              className="w-full h-full rounded-b-xl"
            />
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
