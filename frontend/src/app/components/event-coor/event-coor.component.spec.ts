import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCoorComponent } from './event-coor.component';

describe('EventCoorComponent', () => {
  let component: EventCoorComponent;
  let fixture: ComponentFixture<EventCoorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventCoorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventCoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
