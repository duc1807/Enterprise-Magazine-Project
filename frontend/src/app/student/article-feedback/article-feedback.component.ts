import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ArticleService } from '../../services/article.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-article-feedback',
  templateUrl: './article-feedback.component.html',
  styleUrls: ['./article-feedback.component.css'],
})
export class ArticleFeedbackComponent implements OnInit {
  displayedColumns: string[] = [
    'position',
    'date',
    'id',
    'event',
    'status',
    'action',
  ];
  myArticles: MyArticle[];
  dataSource: MatTableDataSource<MyArticle>;

  private selectArticle: MyArticle;

  articleDetail: any;
  private activeLink: string;
  safeActiveLink: SafeResourceUrl;

  fileList: any[];
  comments: any[];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private articleService: ArticleService,
    private domSanitizer: DomSanitizer,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // this.articleService.getMyArticles().subscribe((data) => {
    //   this.myArticles = data.myArticles;
    //   // console.log('My articles data ', this.myArticles);
    //
    //   this.dataSource = new MatTableDataSource<MyArticle>(this.myArticles);
    //   // console.log('This is data source ', this.dataSource);
    //
    //   this.dataSource.paginator = this.paginator;
    // });

    this.getMyArticles();
  }

  private getMyArticles(): void {
    this.articleService.getMyArticles().subscribe((data) => {
      this.myArticles = data.myArticles;
      this.dataSource = new MatTableDataSource<MyArticle>(this.myArticles);
      setTimeout(() => {
        if (this.dataSource) {
          this.dataSource.paginator = this.paginator;
        }
      }, 500);
      // this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Get one article info, its files and comments
  getArticleInfo(articleId: number): void {
    console.log('Chosen article id ', articleId);

    this.articleService.getFilesInArticle(articleId).subscribe((res) => {
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

  setActive(file_fileId: string): void {
    this.activeLink =
      'https://drive.google.com/file/d/' + file_fileId + '/preview';
    console.log('The new active link ', this.activeLink);
    this.safeActiveLink = this.domSanitizer.bypassSecurityTrustResourceUrl(
      this.activeLink
    );
  }

  refreshTable(): void {
    this.getMyArticles();
  }

  private deleteArticle(articleId: number): void {
    this.articleService.deleteArticle(articleId).subscribe(
      (res) => {
        this.showSuccess('Delete event successfully!');
        this.refreshTable();
      },
      (error) => {
        // this.showError('Can only delete pending article');
        alert(error);
      }
    );
  }

  // Alert
  showSuccess(mes: string): void {
    this.toastr.success(mes);
  }

  showError(mes: string): void {
    this.toastr.error(mes);
  }

  checkDelete(index: number): void {
    this.selectArticle = this.myArticles[index];

    console.log('Select article ', this.selectArticle);

    if (this.selectArticle.article_status === 'pending') {
      // console.log('This article is pending ');
      if (confirm('Are you sure to delete this article?')) {
        this.deleteArticle(this.selectArticle.article_id);
      }
    } else {
      this.showError('Can only delete pending article');
    }
  }
}

export interface MyArticle {
  article_id: number;
  article_submission_date: number;
  article_status: string;
  article_folderId: string;
  FK_account_id: number;
  FK_event_id: number;
  comment_onTime: number;
  event_title: string;
  event_endDate: number;
}
