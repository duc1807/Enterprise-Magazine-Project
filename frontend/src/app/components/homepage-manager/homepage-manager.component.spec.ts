import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageManagerComponent } from './homepage-manager.component';

describe('HomepageManagerComponent', () => {
  let component: HomepageManagerComponent;
  let fixture: ComponentFixture<HomepageManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomepageManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomepageManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
