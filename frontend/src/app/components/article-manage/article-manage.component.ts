import { Component, OnInit } from '@angular/core';
import { Article } from '../../models/article.model';
import { EventService } from '../../services/event.service';
import { SaveDataService } from '../../services/save-data.service';

@Component({
  selector: 'app-article-manage',
  templateUrl: './article-manage.component.html',
  styleUrls: ['./article-manage.component.css'],
})
export class ArticleManageComponent implements OnInit {
  articles = [];

  constructor(
    private eventService: EventService,
    private saveDataService: SaveDataService
  ) {}

  ngOnInit(): void {
    this.getSubmittedArc();
  }

  getSubmittedArc(): void {
    this.eventService
      .getSubmittedArc(this.saveDataService.getEvent())
      .subscribe((data) => {
        this.articles = data.submittedArticles;
      });
  }

  getRejectedArc(): void {}
}
