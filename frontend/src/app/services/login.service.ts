import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IdToken, LoginContent } from '../models/login-content.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private loginUrl = 'http://localhost:5000/api/admin/login'; // URL to web api
  private loginWithGoogle = 'http://localhost:5000/api/authentication/login'; // URL to web api

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  sendLoginContent(us, pw): Observable<any> {
    return this.http.post<any>(
      this.loginUrl,
      { username: us, password: pw } as LoginContent,
      this.httpOptions
    );
  }

  loginWithGoogleAccount(token: string): Observable<any> {
    return this.http.post<any>(
      this.loginWithGoogle,
      { id_token: token } as IdToken,
      this.httpOptions
    );
  }
}
