import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from 'angularx-social-login';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-navbar-coor',
  templateUrl: './navbar-coor.component.html',
  styleUrls: ['./navbar-coor.component.css'],
})
export class NavbarCoorComponent implements OnInit {
  constructor(
    private socialAuthService: SocialAuthService,
    private loginService: LoginService,
    private router: Router,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  logOut(): void {
    this.loginService.logout().subscribe((res) => {
      console.log('Call logout service ', res);
    });
    this.socialAuthService.signOut();
    this.router.navigate(['login']).then((r) => {
      if (r) {
        console.log('Log out succeed!');
      } else {
        console.log('Log out failed');
      }
    });
  }
}
