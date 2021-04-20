import { Component, OnInit } from '@angular/core';
import { TheEvent } from '../../models/event.model';
import { FacultyService } from '../../services/faculty.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event-coor',
  templateUrl: './event-coor.component.html',
  styleUrls: ['./event-coor.component.css'],
})
export class EventCoorComponent implements OnInit {
  events: TheEvent[];

  constructor(
    private facultyService: FacultyService,

    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getEventsByFaculty();
  }

  getEventsByFaculty(): void {
    const id = +this.route.snapshot.paramMap.get('facultyId');

    this.facultyService.getEventsByFaculty(id).subscribe((data) => {
      this.events = data.events;
      console.log(this.events);
    });
  }
}
