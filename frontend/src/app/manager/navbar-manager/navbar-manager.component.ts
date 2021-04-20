import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from 'angularx-social-login';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-navbar-manager',
  templateUrl: './navbar-manager.component.html',
  styleUrls: ['./navbar-manager.component.css'],
})
export class NavbarManagerComponent implements OnInit {
  constructor(
    private socialAuthService: SocialAuthService,
    public route: ActivatedRoute,
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
