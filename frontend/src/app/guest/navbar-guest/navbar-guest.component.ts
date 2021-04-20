import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from 'angularx-social-login';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-navbar-guest',
  templateUrl: './navbar-guest.component.html',
  styleUrls: ['./navbar-guest.component.css'],
})
export class NavbarGuestComponent implements OnInit {
  constructor(
    private socialAuthService: SocialAuthService,
    private router: Router,
    private loginService: LoginService,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  logOut(): void {
    this.loginService.logoutAsGuest().subscribe((res) => {
      console.log('Call logout service ', res);
      alert(res.message);
    });
    this.socialAuthService.signOut();
    this.router.navigate(['login']).then((r) => {
      console.log('Log out succeed? ', r);
    });
  }
}
