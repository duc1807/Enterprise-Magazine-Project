import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-more-article',
  templateUrl: './more-article.component.html',
  styleUrls: ['./more-article.component.css'],
})
export class MoreArticleComponent implements OnInit {
  // articles = [1, 2, 3, 4, 5, 6];

  event: any;
  articles: any[];

  // modal variables
  articleDetail: any;
  fileList: any[];
  comments: any[];
  private activeLink: string;
  safeActiveLink: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private domSanitizer: DomSanitizer,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.getArticles();
  }

  getArticles(): void {
    const eventId = +this.route.snapshot.paramMap.get('eventId');
    console.log('Event id ', eventId);

    this.eventService.getPosted(eventId).subscribe((data) => {
      this.event = data.event;
      this.articles = data.articles;
      console.log('List of articles ', this.articles);
    });
  }

  chooseArticle(articleId: any): void {
    this.articleService.getFilesInArticle(articleId).subscribe((res) => {
      // console.log('REs ', res);
      this.articleDetail = res.article[0];
      console.log('This is article detail ', this.articleDetail);

      this.fileList = this.articleDetail.files;
      this.comments = this.articleDetail.comments;
      console.log('The chosen article comments ', this.comments);
      console.log('This is the file list ', this.fileList);

      this.activeLink =
        'https://drive.google.com/file/d/' +
        this.articleDetail.files[0].file_fileId +
        '/preview';
      // console.log('Active link ', this.activeLink);
      this.safeActiveLink = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.activeLink
      );
    });
  }

  setActive(fileId: any): void {
    this.activeLink = 'https://drive.google.com/file/d/' + fileId + '/preview';
    console.log('The new active link ', this.activeLink);
    this.safeActiveLink = this.domSanitizer.bypassSecurityTrustResourceUrl(
      this.activeLink
    );
  }
}
