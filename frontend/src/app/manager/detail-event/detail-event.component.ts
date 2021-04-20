import { Component, OnInit } from '@angular/core';
import { FacultyService } from '../../services/faculty.service';
import { SchoolEvent } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-detail-event',
  templateUrl: './detail-event.component.html',
  styleUrls: ['./detail-event.component.css'],
})
export class DetailEventComponent implements OnInit {
  eventInfo: any;
  articles: any[];

  // Validate
  form: FormGroup;

  articleDetail: any;
  fileList: any[];
  comments: any[];
  private activeLink: string;
  safeActiveLink: SafeResourceUrl;

  today = new Date();

  // Alert
  showSuccess(message: string): void {
    this.toastr.success(message);
  }

  showError(message: string): void {
    this.toastr.error(message);
  }

  showLoading(): void {
    this.toastr.info('Loading...');
  }

  constructor(
    private facultyService: FacultyService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private articleService: ArticleService,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getPosted();
  }

  getPosted(): void {
    const eventId = +this.route.snapshot.paramMap.get('eventId');
    console.log('This is event id ', eventId);
    this.eventService.getPosted(eventId).subscribe((data) => {
      console.log('data ', data);
      this.eventInfo = data.event;
      this.articles = data.articles;

      // console.log(this.eventInfo);
      // console.log(this.articles);

      this.form = new FormGroup({
        title: new FormControl(this.eventInfo.event_title, [
          Validators.required,
          Validators.pattern('[a-zA-Z0-9.,][a-zA-Z0-9., ]+'),
        ]),
        content: new FormControl(this.eventInfo.event_content, [
          Validators.required,
          Validators.pattern('[a-zA-Z0-9.,][a-zA-Z0-9., ]+'),
        ]),
        startDate: new FormControl('', [Validators.required]),
        endDate: new FormControl('', [Validators.required]),
        updateDate: new FormControl('', [Validators.required]),
      });
    });
  }

  delete(id): void {
    if (confirm('Do you want to delete this event?')) {
      // console.log('You are going to delete this event!');

      console.log(typeof id);
      this.eventService.deleteEvent(id).subscribe((res) => {
        console.log(res);
        if (res.success === true) {
          this.showSuccess('Delete successfully!');
          this.router.navigate([
            'mevent',
            +this.route.snapshot.paramMap.get('facultyId'),
          ]);
        }
      });
    }
  }

  updateEvent(
    value: string,
    value2: string,
    value3: string,
    value4: string,
    value5: string,
    value6: number,
    eventId: number
  ): void {
    // const formData: FormData = new FormData();

    const newEvent: SchoolEvent = new SchoolEvent(
      value,
      value2,
      value3,
      value4,
      value5,
      value6
    );
    console.log('The newEvent ', newEvent);

    const facultyId = +this.route.snapshot.paramMap.get('facultyId');

    // const newEvent2: SchoolEvent = new SchoolEvent(
    //   this.form.get('title').value,
    //   this.form.get('content').value,
    //   this.form.get('startDate').value,
    //   this.form.get('endDate').value,
    //   this.form.get('updateDate').value,
    //   facultyId
    // );
    //
    // console.log(newEvent2);

    // Append newEvent
    // formData.append('newEvent', JSON.stringify(newEvent));

    this.eventService.updateEvent(eventId, newEvent).subscribe((data) => {
      console.log('Data tra ve ', data);
      if (data.success === true) {
        this.showSuccess('Update successfully!');
        this.router.navigate(['mevent', facultyId]);
      } else {
        this.showError('Edit event failed!');
        this.router.navigate(['mevent', facultyId]);
      }
    });
  }

  publishEvent(eventId: number): void {
    if (this.articles.length > 0) {
      this.eventService.publishEvent(eventId).subscribe((res) => {
        this.showSuccess('Publish event successfully!');
        console.log(res);
      });
    } else {
      this.showError('There is no article to publish!');
    }
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
