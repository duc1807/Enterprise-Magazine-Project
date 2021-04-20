import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventPostComponent } from './event-post.component';

describe('EventPostComponent', () => {
  let component: EventPostComponent;
  let fixture: ComponentFixture<EventPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
