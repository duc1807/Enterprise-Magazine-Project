import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['./front-page.component.css'],
})
export class FrontPageComponent implements OnInit {
  publishedEvents: any;

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getPublishedEvents();
  }

  getPublishedEvents(): void {
    const facultyId = +this.route.snapshot.paramMap.get('facultyId');

    this.eventService.getPublishedEvent(facultyId).subscribe((data) => {
      this.publishedEvents = data.publishedEvents;
      console.log('Published events ', this.publishedEvents);
    });
  }
}
