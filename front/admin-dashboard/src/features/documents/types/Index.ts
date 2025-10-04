export interface Document {
    _id: string;
    filename: string;
    content_type: string;
    upload_date: string;
    path_original: string;
    path_chunks?: string;
    comments?: string;
    status: string;
  }


  export interface DocumentEdit {
    filename?: string;
    comments?: string;
    status?: string;
  }


  export interface AddNewDocument {
    comments: string;
    archivo: File;
  }

  export interface DocumentsResponse {
    documents: Document[];
    pagination: {
      limit: number;
      skip: number;
      total: number;
    };
  }