import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarManagerComponent } from './navbar-manager.component';

describe('NavbarManagerComponent', () => {
  let component: NavbarManagerComponent;
  let fixture: ComponentFixture<NavbarManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavbarManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
