import { Component, OnInit } from '@angular/core';
import { FacultyService } from '../../services/faculty.service';
import { TheEvent } from '../../models/event.model';
import { SaveDataService } from '../../services/save-data.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-detail-event',
  templateUrl: './detail-event.component.html',
  styleUrls: ['./detail-event.component.css'],
})
export class DetailEventComponent implements OnInit {
  facultyId: number;
  eventId: number;

  eventInfo: TheEvent;
  articles: Article[];

  constructor(
    private facultyService: FacultyService,
    private saveDataService: SaveDataService
  ) {}

  ngOnInit(): void {
    this.facultyId = this.saveDataService.getFaculty();
    this.eventId = this.saveDataService.getEvent();

    this.getArticleOfEvent();
  }

  getArticleOfEvent(): void {
    this.facultyService
      .getAnEventInfo(this.facultyId, this.eventId)
      .subscribe((data) => {
        this.eventInfo = data.event;
        this.articles = data.articles;

        console.log(this.eventInfo);
        console.log(this.articles);
      });
  }
}
