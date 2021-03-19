import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

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
  constructor(private login: LoginService, private router: Router) {}

  ngOnInit(): void {}

  sendLogin(us, pw): void {
    this.login.loginByAccount(us, pw).subscribe(
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
          console.log('Navigate to admin homepage.');
        } else {
          console.log('Navigation has failed!');
        }
      });
    }
  }
}
