import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IdToken, LoginContent } from '../models/login-content.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private loginUrl = 'http://localhost:5000/api/authentication'; // URL to web api

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  // done
  loginWithGoogleAccount(idToken: IdToken): Observable<any> {
    // login url
    const url = `${this.loginUrl}/login`;

    // Test idToken
    console.log(idToken);

    return this.http.post<any>(url, idToken, this.httpOptions);
  }

  // done
  logout(): Observable<any> {
    const url = `${this.loginUrl}/logout`;

    return this.http.post<any>(url, this.httpOptions);
  }

  /* Co le la khong can */
  checkLoggedIn(): Observable<any> {
    console.log('Call this get');
    return this.http.get<any>(this.loginUrl, this.httpOptions);
  }

  // done
  loginAsGuest(data: LoginContent): Observable<any> {
    const url = `${this.loginUrl}/guest/login`;
    console.log('Guest login API ', url);

    return this.http.post<any>(url, data, this.httpOptions);
  }

  // done
  logoutAsGuest(): Observable<any> {
    const url = `${this.loginUrl}/guest/logout`;
    console.log('Guest logout API ', url);

    return this.http.post<any>(url, this.httpOptions);
  }
}
