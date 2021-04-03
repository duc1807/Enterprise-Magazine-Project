import { Component, OnInit } from '@angular/core';
import { TheEvent } from '../../models/event.model';
import { FacultyService } from '../../services/faculty.service';
import { SaveDataService } from '../../services/save-data.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent implements OnInit {
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
