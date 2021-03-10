import { Component, OnInit } from '@angular/core';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-marketing-login',
  templateUrl: './marketing-login.component.html',
  styleUrls: [
    './marketing-login.component.css',
    '../login/util.css',
    '../login/login.component.css',
  ],
})
export class MarketingLoginComponent implements OnInit {
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
      this.loginService.loginWithGoogleAccount(user.idToken).subscribe(
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
}
