import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarCoorComponent } from './navbar-coor.component';

describe('NavbarCoorComponent', () => {
  let component: NavbarCoorComponent;
  let fixture: ComponentFixture<NavbarCoorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavbarCoorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarCoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
