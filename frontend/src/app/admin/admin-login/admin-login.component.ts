import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: [
    '../../shared/util.css',
    '../../shared/login_style.css',
    './admin-login.component.css',
  ],
})
export class AdminLoginComponent implements OnInit {
  constructor(private router: Router, private adminService: AdminService) {}

  ngOnInit(): void {}

  adminCode: string = 'a1b2c3';
  inputCode: string = '';

  sendLogin(us, pw): void {
    this.adminService.adminSignIn(us, pw).subscribe(
      (res) => {
        console.log('This is the response: ', res);
        this.router.navigate(['user']).then((r) => {
          if (r) {
            console.log('Navigate to admin homepage.');
          } else {
            console.log('Navigation has failed!');
          }
        });
      },
      (err: HttpErrorResponse) => {
        /* Log in false o day */
        console.log('This is the error: ', err);
      }
    );
  }

  showDiv(): void {
    document.getElementById('login-input').style.display = 'block';
    document.getElementById('login-btn').style.display = 'none';
  }
}
