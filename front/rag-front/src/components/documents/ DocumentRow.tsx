import { Document } from "../../types/document";
import ViewButton from "./actions/ViewButton";
import EditButton from "./actions/EditButton";
import DeleteButton from "./actions/DeleteButton";

interface Props {
  doc: Document;
  onView: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onDelete: (id: number) => void;
}

export default function DocumentRow({ doc, onView, onEdit, onDelete }: Props) {
  return (
    <tr>
      <td className="py-3 text-gray-800">{doc.filename}</td>
      <td className="py-3 text-gray-500">{doc.content_type}</td>
      <td className="py-3 text-gray-500">
        {new Date(doc.upload_date).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="flex gap-2">
            <ViewButton doc={doc} onView={onView} />
            <EditButton doc={doc} onEdit={onEdit} />
            <DeleteButton id={doc.id} onDelete={onDelete} />
        </td>
    </tr>
  );
}
