import { Component, OnInit } from '@angular/core';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginContent } from '../../models/login-content.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.css',
    '../../shared/util.css',
    '../../shared/login_style.css',
  ],
})
export class LoginComponent implements OnInit {
  isLoggedin = false;

  constructor(
    private socialAuthService: SocialAuthService,
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    console.log('Is logged in ', this.isLoggedin);
  }

  loginWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);

    this.socialAuthService.authState.subscribe((user) => {
      this.isLoggedin = user != null;

      // Send login idToken
      this.loginService
        .loginWithGoogleAccount({ id_token: user.idToken })
        .subscribe(
          (res) => {
            // console.log('Response of login function ', res);
            this.routing(
              res.user.userInfo.role_id,
              res.user.userInfo.faculty_id
            );
          },
          (err: HttpErrorResponse) => {
            /* Log in false o day */
            console.log(err);
            alert(err.message);
          }
        );
    });
  }

  private routing(role: number, faculty: number): void {
    if (role === 1) {
      this.router
        .navigate(['homepage', faculty])
        .then((r) => console.log('Navigate successfully? ', r));
    }
    if (role === 2) {
      this.router
        .navigate(['coor', faculty])
        .then((r) => console.log('Navigate successfully? ', r));
    }
    if (role === 3) {
      this.router
        .navigate(['faculty'])
        .then((r) => console.log('Navigate successfully? ', r));
    }
  }

  showDiv(): void {
    document.getElementById('login-input').style.display = 'block';
    document.getElementById('login-btn').style.display = 'none';
  }

  hideDiv(): void {
    document.getElementById('login-input').style.display = 'none';
    document.getElementById('login-btn').style.display = 'block';
  }

  guestLogin(username: string, password: string): void {
    const loginInput: LoginContent = { username, password };
    console.log('Guest login input ', loginInput);

    this.loginService.loginAsGuest(loginInput).subscribe(
      (res) => {
        console.log('Response from guest login ', res);
        this.router.navigate(['guest', res.user.faculty_id]);
      },
      (err: HttpErrorResponse) => {
        /* Log in false o day */
        console.log(err);
        alert(err.error.message);
      }
    );
  }
}
