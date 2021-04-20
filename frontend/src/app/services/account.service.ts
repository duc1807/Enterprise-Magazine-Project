import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private accountUrl = 'http://localhost:5000/api/account'; // URL to web api

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  ////////// Service for all roles //////////

  getUserInfo(): Observable<any> {
    const url = `${this.accountUrl}/personal-information`;
    console.log('Get account information API ', url);

    return this.http.get<any>(url, this.httpOptions);
  }

  editUserInfo(accountId: number, info: any): Observable<any> {
    const url = `${this.accountUrl}/${accountId}`;
    console.log('Update account information API ', url);

    return this.http.post<any>(url, info, this.httpOptions);
  }
}
