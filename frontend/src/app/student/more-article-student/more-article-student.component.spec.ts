import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreArticleStudentComponent } from './more-article-student.component';

describe('MoreArticleStudentComponent', () => {
  let component: MoreArticleStudentComponent;
  let fixture: ComponentFixture<MoreArticleStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoreArticleStudentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreArticleStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
