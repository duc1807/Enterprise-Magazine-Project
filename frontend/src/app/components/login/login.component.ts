import { Component, OnInit } from '@angular/core';
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from 'angularx-social-login';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SaveDataService } from '../../services/save-data.service';

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
    private loginService: LoginService,
    private saveDataService: SaveDataService
  ) {}

  ngOnInit(): void {
    console.log('Is logged in ', this.isLoggedin);

    // this.socialAuthService.authState.subscribe((user) => {
    //   this.socialUser = user;
    //   this.isLoggedin = user != null;
    //   // console.log(this.socialUser);
    //
    //   // Send login idToken
    //   this.loginService
    //     .loginWithGoogleAccount({ id_token: user.idToken })
    //     .subscribe(
    //       (res) => {
    //         this.router.navigate(['homepage']).then((r) => {
    //           if (r) {
    //             console.log('Navigation is successful, login success!');
    //           } else {
    //             console.log('Navigation has failed, login failed!');
    //           }
    //         });
    //       },
    //       (err: HttpErrorResponse) => {
    //         console.log(err);
    //       }
    //     );
    // });
  }

  loginWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);

    this.socialAuthService.authState.subscribe((user) => {
      // this.socialUser = user;
      this.isLoggedin = user != null;

      // Send login idToken
      this.loginService
        .loginWithGoogleAccount({ id_token: user.idToken })
        .subscribe(
          (res) => {
            // console.log(res.user.userInfo);
            // console.log(
            //   res.user.userInfo.role_id,
            //   res.user.userInfo.faculty_id
            // );
            this.saveDataService.setUser(res.user.userInfo);

            this.checkRole(
              res.user.userInfo.role_id,
              res.user.userInfo.faculty_id
            );

            this.routing(res.user.userInfo.role_id);
          },
          (err: HttpErrorResponse) => {
            console.log(err);
          }
        );
    });
  }

  private routing(role: number): void {
    if (role === 1) {
      this.router
        .navigate(['homepage'])
        .then((r) => console.log('Navigate successfully? ', r));
    }
    if (role === 2) {
      this.router
        .navigate(['coor'])
        .then((r) => console.log('Navigate successfully? ', r));
    }
    if (role === 3) {
      this.router
        .navigate(['faculty'])
        .then((r) => console.log('Navigate successfully? ', r));
    }
  }

  private checkRole(role: number, faculty: number): void {
    if (role === 1 || role === 2) {
      this.saveDataService.setFaculty(faculty);
    }
  }

  // logOut(): void {
  //   this.socialAuthService.signOut();
  //   console.log('Is logged in: ', this.isLoggedin);
  // }
}
