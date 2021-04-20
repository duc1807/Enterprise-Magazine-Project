import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private statisticUrl = 'http://localhost:5000/api/statistics'; // URL

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  ////////// Service for Manager //////////

  /** GET overall */
  // done
  getOverall(year: number): Observable<any> {
    const url = `${this.statisticUrl}/overall/${year}`;
    console.log('API cua statistics overall ', url);

    return this.http.get<any>(url, this.httpOptions);
  }

  /** GET by faculty */
  // done
  getByFaculty(id: number): Observable<any> {
    const url = `${this.statisticUrl}/${id}`;
    console.log('API cua statistics by id ', url);

    return this.http.get<any>(url, this.httpOptions);
  }
}
