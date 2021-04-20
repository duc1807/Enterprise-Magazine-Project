import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  userInfo: any;

  // firstName: string = 'Bui Dac Nhat Anh';
  // lastName: string;
  // phone: number;

  form: FormGroup;

  constructor(
    private location: Location,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.accountService.getUserInfo().subscribe(
      (data) => {
        this.userInfo = data.userInformation;
        console.log('Account information ', this.userInfo);
      },
      (error) => {
        console.log('Error ', error);
      }
    );

    this.form = new FormGroup({
      firstName: new FormControl(this.userInfo.first_name, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(
          '(^[A-Za-z]{2,})?([ ]{0,1})([A-Za-z]{2,})?([ ]{0,1})([A-Za-z]{2,})?([ ]{0,1})([A-Za-z]{2,})'
        ),
      ]),
      surName: new FormControl(this.userInfo.sur_name, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(12),
        Validators.pattern('^(?=.*[a-zA-Z])[a-zA-Z]+$'),
      ]),
    });
  }

  goBack(): void {
    this.location.back();
  }
}

export interface UpdateInfoContent {
  firstName: string;
  surName: string;
}
