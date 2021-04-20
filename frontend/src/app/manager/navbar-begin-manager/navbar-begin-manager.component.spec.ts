import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarBeginManagerComponent } from './navbar-begin-manager.component';

describe('NavbarBeginManagerComponent', () => {
  let component: NavbarBeginManagerComponent;
  let fixture: ComponentFixture<NavbarBeginManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavbarBeginManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarBeginManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
