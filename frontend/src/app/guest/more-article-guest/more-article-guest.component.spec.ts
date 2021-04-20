import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreArticleGuestComponent } from './more-article-guest.component';

describe('MoreArticleGuestComponent', () => {
  let component: MoreArticleGuestComponent;
  let fixture: ComponentFixture<MoreArticleGuestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoreArticleGuestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreArticleGuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
