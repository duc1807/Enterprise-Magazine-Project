import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from 'angularx-social-login';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar-begin-manager',
  templateUrl: './navbar-begin-manager.component.html',
  styleUrls: ['./navbar-begin-manager.component.css'],
})
export class NavbarBeginManagerComponent implements OnInit {
  constructor(
    private socialAuthService: SocialAuthService,
    private loginService: LoginService,
    private router: Router
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
