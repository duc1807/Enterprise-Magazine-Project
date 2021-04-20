import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from '../../services/admin.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-user-manage',
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.css'],
})
export class UserManageComponent implements OnInit {
  roles: Role[] = [{ role_id: null, role_name: 'Waiting...' }];
  guestData: GuestData[];
  accountData: AccountData[];
  guestForm: FormGroup;
  userForm: FormGroup;

  roleList: string[] = ['Student', 'Coordinator', 'Manager'];
  facultyList: string[] = ['IT', 'Business', 'Marketing'];
  ready = false;

  currentGuest: GuestData;
  currentUser: AccountData;

  dataSource1: MatTableDataSource<GuestData>;
  dataSource2: MatTableDataSource<AccountData>;

  @ViewChild('guestPaginator', { read: MatPaginator })
  guestPaginator: MatPaginator;

  @ViewChild('userPaginator', { read: MatPaginator })
  userPaginator: MatPaginator;

  constructor(private adminService: AdminService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createGuestForm();
    this.createUserForm();
    this.getRoles();
    this.getGuests();

    // console.log('When start ', this.dataSource2);
  }

  getRoles(): void {
    this.adminService.getRoles().subscribe((data) => {
      this.roles = data.roles;
    });
  }

  getGuests(): void {
    this.adminService.getGuest().subscribe((data) => {
      this.guestData = data.guestAccounts;
      console.log('Guest data ', this.guestData);
      this.dataSource1 = new MatTableDataSource<GuestData>(this.guestData);

      this.resetPag();
    });
  }

  getAccounts(roleId: number): void {
    this.accountData = undefined;
    this.dataSource2 = undefined;
    this.userPaginator = undefined;
    console.log('Lay du lieu role ', roleId);

    this.adminService.getAccounts(roleId).subscribe((data) => {
      console.log('Get data success');
      this.accountData = data.accounts;

      this.dataSource2 = new MatTableDataSource<AccountData>(this.accountData);
      console.log('Data source 2 ', this.dataSource2);
      setTimeout(() => {
        if (this.dataSource2) {
          this.dataSource2.paginator = this.userPaginator;
          console.log('User pag ', this.userPaginator);
        }
      }, 1000);
    });
  }

  resetPag(): void {
    console.log('Data source 1 ', this.dataSource1);
    setTimeout(() => {
      if (this.dataSource1) {
        this.dataSource1.paginator = this.guestPaginator;
      }
    }, 1000);
  }

  changeGuestStatus(element): void {
    // console.log(element);
    if (confirm('Confirm change status!')) {
      if (element.enabled === 1) {
        const newStatus: NewStatus = { status: element.enabled };
        console.log('Status ', newStatus, typeof newStatus.status);

        this.adminService
          .changeGuestStatus(element.guest_id, newStatus)
          .subscribe(
            (res) => {
              console.log('Success ', res);
            },
            (error) => {
              console.log(error);
            }
          );
        element.enabled = 0;
      } else {
        const newStatus: NewStatus = { status: element.enabled };
        console.log('Status ', newStatus, typeof newStatus.status);

        this.adminService
          .changeGuestStatus(element.guest_id, newStatus)
          .subscribe(
            (res) => {
              console.log('Success ', res);
            },
            (error) => {
              console.log(error);
            }
          );
        element.enabled = 1;
      }
    }
  }

  changeUserStatus(element): void {
    console.log(element);
    if (confirm('Confirm change status!')) {
      if (element.enabled === 1) {
        const newStatus: NewStatus = { status: element.enabled };
        console.log('Status ', newStatus, typeof newStatus.status);

        this.adminService
          .changeUserStatus(element.account_id, newStatus)
          .subscribe(
            (res) => {
              console.log('Success ', res);
            },
            (error) => {
              console.log(error);
            }
          );
        element.enabled = 0;
      } else {
        const newStatus: NewStatus = { status: element.enabled };
        console.log('Status ', newStatus, typeof newStatus.status);

        this.adminService
          .changeUserStatus(element.account_id, newStatus)
          .subscribe(
            (res) => {
              console.log('Success ', res);
            },
            (error) => {
              console.log(error);
            }
          );
        element.enabled = 1;
      }
    }
  }

  createUserForm(): void {
    this.userForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(
            '(^[A-Za-z]{2,})?([ ]{0,1})([A-Za-z]{2,})?([ ]{0,1})([A-Za-z]{2,})?([ ]{0,1})([A-Za-z]{2,})'
          ),
        ],
      ],
      surname: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(12),
          Validators.pattern('^(?=.*[a-zA-Z])[a-zA-Z]+$'),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ],
      ],
      role: ['', Validators.required],
      faculty: ['', Validators.required],
    });
  }

  createGuestForm(): void {
    this.guestForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$'),
        ],
      ],
      PasswordValidation: this.fb.group(
        {
          password: [
            '',
            [
              Validators.required,
              Validators.minLength(6),
              Validators.maxLength(16),
              Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$'),
            ],
          ],
          confirmPassword: ['', Validators.required],
        },
        {
          validator: CustomValidation.MatchPassword, // your validation method
        }
      ),
      faculty: ['', Validators.required],
    });
  }

  setGuest(index: number): void {
    console.log('Chosen guest ', this.guestData[index]);
    this.currentGuest = this.guestData[index];
  }

  setUser(index: number): void {
    console.log('Chosen user ', this.accountData[index]);
    this.currentUser = this.accountData[index];
  }

  resetChosen(): void {
    this.currentGuest = undefined;
    this.currentUser = undefined;
  }

  testChosen(): void {
    console.log('Current guest ', this.currentGuest);
    console.log('Current user ', this.currentUser);
    console.log('Guest form ', this.guestForm.value);
    console.log('User form ', this.userForm.value);
  }

  chooseFaculty1(event): void {
    this.guestForm.get('faculty').setValue(event.target.value);
  }

  chooseRole2(event): void {
    this.userForm.get('role').setValue(event.target.value);

    if (this.userForm.get('role').value !== '3: Manager') {
      this.ready = true;
    } else {
      this.userForm.get('faculty').setValue('99: All');
    }
  }

  chooseFaculty2(event): void {
    this.userForm.get('faculty').setValue(event.target.value);
  }

  onSubmitGuest(): void {
    console.log('This is my form ', this.guestForm.value);

    const faculty = parseInt(
      this.guestForm.get('faculty').value.split(': ')[0],
      10
    );

    const newGuest: NewGuest = {
      username: this.guestForm.get('username').value,
      password: this.guestForm.get('PasswordValidation.password').value,
      facultyId: faculty,
    };

    this.adminService.createGuest(newGuest).subscribe(
      (res) => {
        console.log(res);
        this.guestForm = undefined;
        this.createGuestForm();
        this.getGuests();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onSubmitUser(): void {
    console.log('This is my form ', this.userForm.value);

    const role = parseInt(this.userForm.get('role').value.split(': ')[0], 10);
    const faculty = parseInt(
      this.userForm.get('faculty').value.split(': ')[0],
      10
    );

    const newUser: NewUser = {
      email: this.userForm.get('email').value,
      firstName: this.userForm.get('firstName').value,
      surName: this.userForm.get('surname').value,
      roleId: role,
      facultyId: faculty,
    };
    // console.log('New user ', newUser);

    this.adminService.createAccount(newUser).subscribe(
      (res) => {
        console.log(res);
        this.userForm = undefined;
        this.createUserForm();
        this.ready = false;
      },
      (error) => {
        console.log(error);
      }
    );
  }
}

export interface AccountData {
  account_id: number;
  email: string;
  FK_role_id: number;
  FK_faculty_id: number;
  enabled: number;
  AccountInfo_id: number;
  first_name: string;
  sur_name: string;
  FK_account_id: number;
}

export interface NewUser {
  email: string;
  firstName: string;
  surName: string;
  roleId: number;
  facultyId: number;
}

export interface NewGuest {
  username: string;
  password: string;
  facultyId: number;
}

export interface GuestData {
  guest_id: number;
  guest_name: string;
  password: string;
  FK_faculty_id: number;
  enabled: number;
}

export interface Role {
  role_id?: number | undefined;
  role_name: string;
}

export interface NewStatus {
  status: number;
}

export class CustomValidation {
  static MatchPassword(abstractControl: AbstractControl): any {
    const password = abstractControl.get('password').value;
    const confirmPassword = abstractControl.get('confirmPassword').value;
    if (password !== confirmPassword) {
      abstractControl.get('confirmPassword').setErrors({
        MatchPassword: true,
      });
    } else {
      return null;
    }
  }
}
