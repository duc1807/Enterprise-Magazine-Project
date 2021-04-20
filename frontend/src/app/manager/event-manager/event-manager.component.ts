import { Component, OnInit } from '@angular/core';
import { FacultyService } from '../../services/faculty.service';
import { TheEvent } from '../../models/event.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event-manager',
  templateUrl: './event-manager.component.html',
  styleUrls: ['./event-manager.component.css'],
})
export class EventManagerComponent implements OnInit {
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
    console.log('Faculty id ', id);

    this.facultyService.getEventsByFaculty(id).subscribe((data) => {
      this.events = data.events;
      console.log(this.events);
    });
  }
}
