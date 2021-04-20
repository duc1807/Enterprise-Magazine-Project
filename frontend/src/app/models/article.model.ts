export interface Article {
  article_id: number;
  article_submission_date: number;
  article_status: string;
  article_folderId: string;
  FK_account_id: number;
  FK_event_id: number;
}

export interface FullArticle {
  article_id: number;
  article_submission_date: number;
  article_status: string;
  article_folderId: string;
  email: string;
  firstName: string;
  surName: string;
  FK_faculty_id: number;
  FK_account_id: number;
  FK_event_id: number;
  files: ReturnFile[];
}

export interface ReturnFile {
  file_id: number;
  file_mimeType: string;
  file_name: string;
  file_fileId: string;
  FK_article_id: number;
}
