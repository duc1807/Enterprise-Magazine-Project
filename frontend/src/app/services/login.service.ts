import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IdToken, LoginContent } from '../models/login-content.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private loginForAdmin = 'http://localhost:5000/api/admin/login'; // URL to web api
  private loginWithGoogle = 'http://localhost:5000/api/authentication'; // URL to web api

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  loginByAccount(us, pw): Observable<any> {
    return this.http.post<any>(
      this.loginForAdmin,
      { username: us, password: pw } as LoginContent,
      this.httpOptions
    );
  }

  loginWithGoogleAccount(idToken: IdToken): Observable<any> {
    // login url
    const url = `${this.loginWithGoogle}/login`;

    // Test idToken
    console.log(idToken);
    // console.log(JSON.stringify(idToken));

    return this.http.post<any>(url, idToken, this.httpOptions);
  }

  logout(): Observable<any> {
    const url = `${this.loginWithGoogle}/logout`;
    return this.http.post<any>(url, this.httpOptions);
  }

  isLoggedIn(): Observable<any> {
    return this.http.get<any>(this.loginWithGoogle, this.httpOptions);
  }
}
