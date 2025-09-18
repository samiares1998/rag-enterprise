import RecentDocuments from "../../components/documents/documents";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="RAG APP"
        description=""
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 ">
          <RecentDocuments />
        </div>
      </div>
    </>
  );
}
