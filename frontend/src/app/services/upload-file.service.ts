import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SaveDataService } from './save-data.service';

@Injectable({
  providedIn: 'root',
})
export class UploadFileService {
  private baseUrl = 'http://localhost:5000/api/upload';

  constructor(
    private http: HttpClient,
    private saveDataService: SaveDataService
  ) {}

  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const url = `${this.baseUrl}/${this.saveDataService.getEvent()}`;
    const req = new HttpRequest('POST', `${url}`, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request(req);
  }

  getFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }
}
