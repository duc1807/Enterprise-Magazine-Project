import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingLoginComponent } from './marketing-login.component';

describe('MarketingLoginComponent', () => {
  let component: MarketingLoginComponent;
  let fixture: ComponentFixture<MarketingLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketingLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
