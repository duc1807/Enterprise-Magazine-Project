import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UploadFileService {
  private baseUrl = 'http://localhost:5000/api/upload';

  constructor(private http: HttpClient) {}

  // upload(file: File): Observable<HttpEvent<any>> {
  //   const formData: FormData = new FormData();
  //
  //   formData.append('file', file);
  //
  //   const req = new HttpRequest('POST', `${this.baseUrl}`, formData, {
  //     reportProgress: true,
  //     responseType: 'json',
  //   });
  //
  //   return this.http.request(req);
  // }

  upload(eventId: number, form: FormData): Observable<HttpEvent<any>> {
    const url = `${this.baseUrl}/${eventId}`;
    console.log(url);
    console.log('form in service ', form.get('newArticle'));
    return this.http.post<any>(url, form).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }
}
