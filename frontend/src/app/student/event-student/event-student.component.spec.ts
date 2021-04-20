import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventStudentComponent } from './event-student.component';

describe('EventStudentComponent', () => {
  let component: EventStudentComponent;
  let fixture: ComponentFixture<EventStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventStudentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
