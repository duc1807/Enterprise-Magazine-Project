import { Component, OnInit } from '@angular/core';
import { TheEvent } from '../../models/event.model';
import { FacultyService } from '../../services/faculty.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event-post',
  templateUrl: './event-post.component.html',
  styleUrls: [
    './event-post.component.css',
    '../event-coor/event-coor.component.css',
  ],
})
export class EventPostComponent implements OnInit {
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
