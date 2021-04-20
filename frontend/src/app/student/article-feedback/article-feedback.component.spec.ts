import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleFeedbackComponent } from './article-feedback.component';

describe('ArticleFeedbackComponent', () => {
  let component: ArticleFeedbackComponent;
  let fixture: ComponentFixture<ArticleFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArticleFeedbackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
