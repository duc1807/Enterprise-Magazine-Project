import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private articleUrl = 'http://localhost:5000/api/article'; // URL to web api

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  ////////// Service for Students //////////
  // done1
  getMyArticles(): Observable<any> {
    const url = `${this.articleUrl}/my-articles`;
    console.log('Get my articels ', url);

    return this.http.get<any>(url, this.httpOptions);
  }

  ////////// Service for Coordinator //////////
  addNewPost(eventId: number, formData: FormData): Observable<any> {
    const url = `${this.articleUrl}/post-article/${eventId}`;
    console.log('Add a new post API ', url);

    return this.http.post<any>(url, formData).pipe(
      map((res) => {
        return res;
      })
    );
  }

  addComment(articleId: number, comment: string): Observable<any> {
    const url = `${this.articleUrl}/${articleId}/comments`;
    console.log('Add comment api ', url);
    console.log('Day la comment ', comment);

    return this.http.post<any>(url, { content: comment }, this.httpOptions);
  }

  acceptAtcl(articleId: number): Observable<any> {
    const url = `${this.articleUrl}/${articleId}/select`;
    console.log('Accept article api ', url);

    return this.http.patch<any>(url, this.httpOptions);
  }

  rejectAtcl(articleId: number): Observable<any> {
    const url = `${this.articleUrl}/${articleId}/reject`;
    console.log('Reject article api ', url);

    return this.http.patch<any>(url, this.httpOptions);
  }

  getComments(articleId: number): Observable<any> {
    const url = `${this.articleUrl}/${articleId}/comments`;
    console.log('Get comments api ', url);

    return this.http.get<any>(url, this.httpOptions);
  }

  getFilesInArticle(articleId: number): Observable<any> {
    const url = `${this.articleUrl}/${articleId}`;
    console.log('Get files of an article API ', url);

    return this.http.get(url);
  }

  getArticle(articleId: number): Observable<any> {
    const url = `${this.articleUrl}/posted/${articleId}`;
    console.log('View a posted article URL ', url);

    return this.http.get<any>(url, this.httpOptions);
  }

  ////////// Service for Student //////////
  deleteFile(articleId: number, fileId: number): Observable<any> {
    const url = `${this.articleUrl}/${articleId}/file/${fileId}`;
    console.log('Delete file API ', url);

    return this.http.delete<any>(url, this.httpOptions);
  }

  updateNewFiles(articleId: number, formData: any): Observable<any> {
    const url = `${this.articleUrl}/${articleId}/update-submission`;
    console.log('Update article API ', url);

    // return this.http.put<any>(url, formData, this.httpOptions);
    const req = new HttpRequest('PUT', url, formData);
    return this.http.request(req);
  }

  deleteArticle(articleId: number): Observable<any> {
    const url = `${this.articleUrl}/${articleId}`;
    console.log('Delete article API ', url);

    return this.http.delete<any>(url, this.httpOptions);
  }
}
