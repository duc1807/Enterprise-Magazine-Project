import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from 'angularx-social-login';

@Component({
  selector: 'app-navbar-coor',
  templateUrl: './navbar-coor.component.html',
  styleUrls: ['./navbar-coor.component.css'],
})
export class NavbarCoorComponent implements OnInit {
  constructor(private socialAuthService: SocialAuthService) {}

  ngOnInit(): void {}

  logOut(): void {
    this.socialAuthService.signOut();
  }
}
