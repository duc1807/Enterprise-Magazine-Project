import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from 'angularx-social-login';

@Component({
  selector: 'app-navbar-manager',
  templateUrl: './navbar-manager.component.html',
  styleUrls: ['./navbar-manager.component.css'],
})
export class NavbarManagerComponent implements OnInit {
  constructor(private socialAuthService: SocialAuthService) {}

  ngOnInit(): void {}

  logOut(): void {
    this.socialAuthService.signOut();
  }
}
