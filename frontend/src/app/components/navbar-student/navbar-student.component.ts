import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from 'angularx-social-login';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar-student',
  templateUrl: './navbar-student.component.html',
  styleUrls: ['./navbar-student.component.css'],
})
export class NavbarStudentComponent implements OnInit {
  constructor(
    private socialAuthService: SocialAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  logOut(): void {
    this.socialAuthService.signOut();
    this.router.navigate(['login']).then((r) => {
      if (r) {
        console.log('Navigation is successful!');
      } else {
        console.log('Navigation has failed!');
      }
    });
  }
}
