import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-article-manage',
  templateUrl: './article-manage.component.html',
  styleUrls: ['./article-manage.component.css'],
})
export class ArticleManageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  articles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
}
