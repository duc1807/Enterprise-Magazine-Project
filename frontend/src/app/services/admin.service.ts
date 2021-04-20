import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginContent } from '../models/login-content.model';
import { NewStatus } from '../admin/user-manage/user-manage.component';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private admin = 'http://localhost:5000/api/admin'; // URL to web api
  private adminLogin = 'http://localhost:5000/api/authentication/admin/login'; // URL to login for admin

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  /** Login for admin */
  // done
  adminSignIn(us, pw): Observable<any> {
    return this.http.post<any>(
      this.adminLogin,
      { username: us, password: pw } as LoginContent,
      this.httpOptions
    );
  }

  /** Logout for admin */
  adminSignOut(): Observable<any> {
    return this.http.post<any>(this.admin + '/logout', this.httpOptions);
  }

  getRoles(): Observable<any> {
    return this.http.get<any>(this.admin + '/roles', this.httpOptions);
  }

  /** GET accounts by role */
  getAccounts(roleId: number): Observable<any> {
    const url = `${this.admin}/accounts/${roleId}`;

    return this.http.get<any>(url, this.httpOptions);
  }

  /** GET guest accounts */
  getGuest(): Observable<any> {
    return this.http.get<any>(this.admin + '/guest-accounts', this.httpOptions);
  }

  createAccount(data): Observable<any> {
    const url = `${this.admin}/accounts`;

    return this.http.post<any>(url, data, this.httpOptions);
  }

  createGuest(data): Observable<any> {
    const url = `${this.admin}/guest-accounts`;
    console.log('Call create guest ');
    return this.http.post<any>(url, data, this.httpOptions);
  }

  // Hien tai khong con chuc nang up date account
  /*
  updateAccount(id: number, data): Observable<any> {
    const url = `${this.admin}/accounts/${id}`;

    return this.http.put<any>(url, data, this.httpOptions);
  }
  */

  editGuest(id: number, data): Observable<any> {
    const url = `${this.admin}/guest-accounts/${id}`;

    return this.http.put<any>(url, data, this.httpOptions);
  }

  changeUserStatus(accountId: number, status: NewStatus): Observable<any> {
    const url = `${this.admin}/accounts/${accountId}`;
    console.log('Change user status API ', url);

    return this.http.patch<any>(url, status, this.httpOptions);
  }

  changeGuestStatus(accountId: number, status: NewStatus): Observable<any> {
    const url = `${this.admin}/guest-accounts/${accountId}`;
    console.log('Change guest status API ', url);

    return this.http.patch<any>(url, status, this.httpOptions);
  }
}
