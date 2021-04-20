import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from 'angularx-social-login';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-navbar-student',
  templateUrl: './navbar-student.component.html',
  styleUrls: ['./navbar-student.component.css'],
})
export class NavbarStudentComponent implements OnInit {
  constructor(
    private socialAuthService: SocialAuthService,
    private router: Router,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  logOut(): void {
    this.socialAuthService.signOut();
    this.socialAuthService.authState.subscribe((user) => {
      console.log('When log out ', user.idToken);
    });
    this.router.navigate(['login']).then((r) => {
      if (r) {
        console.log('Log out succeed!');
      } else {
        console.log('Log out failed');
      }
    });
  }
}
