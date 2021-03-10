import { Component, OnInit } from '@angular/core';
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from 'angularx-social-login';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', './util.css'],
})
export class LoginComponent implements OnInit {
  socialUser: SocialUser;
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
      this.socialUser = user;
      this.isLoggedin = user != null;
      // console.log(this.socialUser);

      // Send login idToken
      this.loginService
        .loginWithGoogleAccount(this.socialUser.idToken)
        .subscribe(
          () => {
            this.router.navigate(['homepage']).then((r) => {
              if (r) {
                console.log('Navigation is successful!');
              } else {
                console.log('Navigation has failed!');
              }
            });
          },
          (err: HttpErrorResponse) => {
            console.log(err);
          }
        );
    });
  }

  logOut(): void {
    this.socialAuthService.signOut();
    console.log('Is logged in: ', this.isLoggedin);
  }
}
