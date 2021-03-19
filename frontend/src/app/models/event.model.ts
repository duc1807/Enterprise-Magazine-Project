export class SchoolEvent {
  title: string;
  content: string;
  // imageData?: string;
  startDate: Date;
  endDate: Date;
  facultyId?: number;
}

export interface TheEvent {
  event_id: number;
  event_title: string;
  event_content: string;
  event_image?: string;
  event_startDate?: number;
  event_endDate?: number;
  event_createAt?: number;
  event_lastUpdate?: number;
  event_folderId?: string;
  folderId_selectedArticles?: string;
  folderId_allArticles?: string;
  FK_faculty_id: number;
}
