import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageCoorComponent } from './homepage-coor.component';

describe('HomepageCoorComponent', () => {
  let component: HomepageCoorComponent;
  let fixture: ComponentFixture<HomepageCoorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomepageCoorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomepageCoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
