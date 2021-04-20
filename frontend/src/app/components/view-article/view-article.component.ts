import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ArticleService } from '../../services/article.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-article',
  templateUrl: './view-article.component.html',
  styleUrls: ['./view-article.component.css'],
})
export class ViewArticleComponent implements OnInit {
  article: any;

  constructor(
    private location: Location,
    private articleService: ArticleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getArticle();
  }

  getArticle(): void {
    const articleId = +this.route.snapshot.paramMap.get('articleId');

    this.articleService.getArticle(articleId).subscribe((data) => {
      this.article = data.article;
      console.log('This is the article ', this.article);
    });
  }

  goBack(): void {
    this.location.back();
  }
}
