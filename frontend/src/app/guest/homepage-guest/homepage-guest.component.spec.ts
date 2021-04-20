import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageGuestComponent } from './homepage-guest.component';

describe('HomepageGuestComponent', () => {
  let component: HomepageGuestComponent;
  let fixture: ComponentFixture<HomepageGuestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomepageGuestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomepageGuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
