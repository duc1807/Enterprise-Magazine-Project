import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { FacultyService } from '../../services/faculty.service';
import { SaveDataService } from '../../services/save-data.service';
import { TheEvent } from '../../models/event.model';

@Component({
  selector: 'app-event-coor',
  templateUrl: './event-coor.component.html',
  styleUrls: ['./event-coor.component.css'],
})
export class EventCoorComponent implements OnInit {
  events: TheEvent[];

  constructor(
    private facultyService: FacultyService,
    private saveDataService: SaveDataService
  ) {}

  ngOnInit(): void {
    this.getEventsByFaculty();
  }

  getEventsByFaculty(): void {
    this.facultyService
      .getEventsByFaculty(this.saveDataService.getFaculty())
      .subscribe((data) => {
        this.events = data.events;
        console.log(this.events);
      });
  }

  setEvent(value: number): void {
    this.saveDataService.setEvent(value);
  }
}
