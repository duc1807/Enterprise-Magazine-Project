import { Component, OnInit } from '@angular/core';
import { FullArticle } from '../../models/article.model';
import { EventService } from '../../services/event.service';
import { ArticleService } from '../../services/article.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-article-manage',
  templateUrl: './article-manage.component.html',
  styleUrls: ['./article-manage.component.css'],
})
export class ArticleManageComponent implements OnInit {
  // Validate
  form: FormGroup;

  articles: FullArticle[];
  currentArticle: FullArticle;

  private activeLink: string;

  safeActiveLink: SafeResourceUrl;
  comments: [];

  constructor(
    private eventService: EventService,
    private articleService: ArticleService,
    private domSanitizer: DomSanitizer,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  // Alert
  showSuccess(): void {
    this.toastr.success('Comment successfully!');
  }

  showError(): void {
    this.toastr.error('Comment failed!');
  }

  showLoading(): void {
    this.toastr.info('Loading...');
  }

  ngOnInit(): void {
    // Test log
    // console.log('The form ', this.form);

    this.getPendingAtcl();
    this.createForm();
  }

  createForm(): void {
    this.form = new FormGroup({
      status: new FormControl('', Validators.required),
      comment: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9.,()!@#$%^&*][a-zA-Z0-9.,()!@#$%^&* ]+'),
      ]),
    });
  }

  // Check
  getPendingAtcl(): void {
    this.articles = undefined;

    const eventId = +this.route.snapshot.paramMap.get('eventId');
    console.log('This is the event id ', eventId);

    this.eventService.getPending(eventId).subscribe((data) => {
      this.articles = data.submittedArticles;
      console.log('Pending atcl ', this.articles);
    });
  }

  getSelectedAtcl(): void {
    this.articles = undefined;

    const eventId = +this.route.snapshot.paramMap.get('eventId');

    this.eventService.getSelected(eventId).subscribe((data) => {
      this.articles = data.selectedArticles;
      console.log('Accepted atcl ', this.articles);
    });
  }

  getRejectedAtcl(): void {
    this.articles = undefined;

    const eventId = +this.route.snapshot.paramMap.get('eventId');

    this.eventService.getRejected(eventId).subscribe((data) => {
      this.articles = data.rejectedArticles;
      console.log('Rejected atcl ', this.articles);
    });
  }

  /**
   * Need to set a linkTerm here
   */
  chooseArticle(index: number): void {
    this.currentArticle = this.articles[index];
    console.log('Current article ', this.currentArticle);

    this.getComments(this.currentArticle.article_id);

    this.activeLink =
      'https://drive.google.com/file/d/' +
      this.currentArticle.files[0].file_fileId +
      '/preview';
    console.log('The active link ', this.activeLink);
    this.safeActiveLink = this.domSanitizer.bypassSecurityTrustResourceUrl(
      this.activeLink
    );
  }

  setActive(file_fileId: string): void {
    this.activeLink =
      'https://drive.google.com/file/d/' + file_fileId + '/preview';
    console.log('The new active link ', this.activeLink);
    this.safeActiveLink = this.domSanitizer.bypassSecurityTrustResourceUrl(
      this.activeLink
    );
  }

  onSubmit(): void {
    // console.log('Final form ', this.form.value);
    const comment = this.form.get('comment').value;
    const status = this.form.get('status').value;
    const id = this.currentArticle.article_id;

    this.articleService.addComment(id, comment).subscribe(
      (res) => {
        if (res && status === 'accept') {
          this.articleService.acceptAtcl(id).subscribe((res2) => {
            console.log('Second response ', res2);
            this.resetChosen();
            this.getPendingAtcl();
          });
        } else {
          this.articleService.rejectAtcl(id).subscribe((res2) => {
            console.log('Second response ', res2);
            this.resetChosen();
            this.getPendingAtcl();
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  resetChosen(): void {
    this.form = undefined;
    this.currentArticle = undefined;
    this.resetRadio();

    this.createForm();
  }

  changeArticleStatus(b: boolean): void {
    if (b) {
      this.form.get('status').setValue('accept');
      // console.log('Status ', this.form.get('status').value);
    } else {
      this.form.get('status').setValue('decline');
      // console.log('Status ', this.form.get('status').value);
    }
  }

  private getComments(atclId: number): void {
    this.articleService.getComments(atclId).subscribe((data) => {
      this.comments = data.comments;
      console.log('Comments ', this.comments);
    });
  }

  private resetRadio(): void {
    const success = document.getElementById(
      'success-outlined'
    ) as HTMLInputElement;
    success.checked = false;
    const danger = document.getElementById(
      'danger-outlined'
    ) as HTMLInputElement;
    danger.checked = false;
  }
}
