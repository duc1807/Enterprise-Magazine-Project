import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostedService {
  private postUrl = 'http://localhost:5000/api/posted'; // URL to web api

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  getPublishArticle(postedId: number): Observable<any> {
    const url = `${this.postUrl}/${postedId}`;
    console.log('Get posted article API ', url);

    return this.http.get<any>(url, this.httpOptions);
  }
}
