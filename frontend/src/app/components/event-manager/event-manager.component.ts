import { Component, OnInit } from '@angular/core';
import { FacultyService } from '../../services/faculty.service';
import { TheEvent } from '../../models/event.model';
import { SaveDataService } from '../../services/save-data.service';

@Component({
  selector: 'app-event-manager',
  templateUrl: './event-manager.component.html',
  styleUrls: ['./event-manager.component.css'],
})
export class EventManagerComponent implements OnInit {
  id: number;
  events: TheEvent[];

  constructor(
    private facultyService: FacultyService,
    private saveDataService: SaveDataService
  ) {}

  ngOnInit(): void {
    this.id = this.saveDataService.getFaculty();

    this.getEventsByFaculty();
  }

  getEventsByFaculty(): void {
    this.facultyService.getEventsByFaculty(this.id).subscribe((data) => {
      this.events = data.events;
      console.log(this.events);
    });
  }

  setEvent(value: number): void {
    this.saveDataService.setEvent(value);
  }
}
