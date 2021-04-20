import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-edit-article',
  templateUrl: './edit-article.component.html',
  styleUrls: ['./edit-article.component.css'],
})
export class EditArticleComponent implements OnInit {
  // articles = ['text.pdf', 'image.png', 'img2.jpg'];
  // article;

  today = Date.now();

  files: any[];
  articleDetail: any;
  form: FormGroup;

  newUploadFiles: FileList;
  eventInfo: any;

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('articleId');
    console.log('Article id ', id);
    // this.articleService.getArticle();

    this.form = new FormGroup({
      agreeTerm: new FormControl('', [Validators.required]),
      file: new FormControl('', [Validators.required]),
    });

    this.articleService.getFilesInArticle(id).subscribe((res) => {
      this.articleDetail = res.article[0];
      console.log('Article details ', this.articleDetail);
      this.files = this.articleDetail.files;
      console.log('File list ', this.files);

      setTimeout(() => {
        if (this.articleDetail) {
          this.eventService
            .getEvent(this.articleDetail.FK_event_id)
            .subscribe((res2) => {
              console.log(res2);
              this.eventInfo = res2.event;
            });
        }
      }, 1000);
    });
  }

  deleteFile(file): void {
    if (file > -1) {
      const delFile = this.files.splice(file, 1);
      console.log('Delete file ? ', delFile);
      // console.log('List file ', this.files);

      const id = +this.route.snapshot.paramMap.get('articleId');
      this.articleService.deleteFile(id, delFile[0].file_id).subscribe(
        (res) => {
          console.log('Response ', res);
        },
        (error) => {
          console.log('Error ', error);
        }
      );
    }
  }

  onSubmit(): void {
    const formData: FormData = new FormData();

    for (let i = 0; i < this.newUploadFiles.length; i++) {
      formData.append(
        'files[]',
        this.newUploadFiles[i],
        this.newUploadFiles[i].name
      );
    }

    console.log('Form data ', formData);

    const articleId = +this.route.snapshot.paramMap.get('articleId');
    console.log('Update to article? ', articleId);

    this.articleService.updateNewFiles(articleId, formData).subscribe(
      (res) => {
        // this.showSuccess();
        console.log('Success ', res);
        this.router.navigate([
          'feedback',
          +this.route.snapshot.paramMap.get('facultyId'),
        ]);
      },
      (err) => {
        // this.showError();
        console.log('Error ', err);
        this.router.navigate([
          'feedback',
          +this.route.snapshot.paramMap.get('facultyId'),
        ]);
      }
    );
  }

  uploadFiles(event): void {
    this.newUploadFiles = event.target.files;
  }
}
