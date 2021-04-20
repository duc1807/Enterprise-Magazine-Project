import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreArticleComponent } from './more-article.component';

describe('MoreArticleComponent', () => {
  let component: MoreArticleComponent;
  let fixture: ComponentFixture<MoreArticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoreArticleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
