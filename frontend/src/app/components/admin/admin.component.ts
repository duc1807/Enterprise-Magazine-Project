import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: [
    '../login/util.css',
    '../login/login.component.css',
    './admin.component.css',
  ],
})
export class AdminComponent implements OnInit {
  constructor() {}

  adminCode: string = 'a1b2c3';
  inputCode: string = '';

  ngOnInit(): void {}
}
