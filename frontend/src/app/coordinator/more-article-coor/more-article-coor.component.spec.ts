import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreArticleCoorComponent } from './more-article-coor.component';

describe('MoreArticleCoorComponent', () => {
  let component: MoreArticleCoorComponent;
  let fixture: ComponentFixture<MoreArticleCoorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoreArticleCoorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreArticleCoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
