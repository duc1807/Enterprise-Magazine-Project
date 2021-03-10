import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: [
    '../login/util.css',
    '../login/login.component.css',
    './admin-login.component.css',
  ],
})
export class AdminLoginComponent implements OnInit {
  loginResponse: any;
  constructor(
    private login: LoginService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {}

  sendLogin(us, pw): void {
    this.login.sendLoginContent(us, pw).subscribe(
      (res) => {
        console.log('This is the response: ', res);
        this.loginResponse = res;
      },
      (err: HttpErrorResponse) => {
        console.log('This is the error: ', err);
        this.loginResponse = err;
      }
    );

    // Navigate code
    if (this.loginResponse.success === true) {
      this.router.navigate(['homepage']).then((r) => {
        if (r) {
          console.log('Navigation is successful!');
        } else {
          console.log('Navigation has failed!');
        }
      });
    }
  }
}
