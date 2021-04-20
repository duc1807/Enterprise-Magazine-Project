import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UploadFileService } from '../../services/upload-file.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit {
  selectedFiles: FileList;
  form: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private uploadService: UploadFileService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9.,][a-zA-Z0-9.:, ]+'),
      ]),
      content: new FormControl('', [
        Validators.required,
        Validators.maxLength(255),
        // Validators.pattern('[a-zA-Z0-9.,][a-zA-Z0-9., ]+'),
        // Validators.pattern('^(?!\\s*$).+'),
      ]),
      author: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9.,][a-zA-Z0-9:., ]+$'),
      ]),
      agreeTerm: new FormControl('', [Validators.required]),
      file: new FormControl('', [Validators.required]),
    });
  }

  routerBack(): void {
    const id = +this.route.snapshot.paramMap.get('facultyId');
    console.log('Id from the url ', id);
    this.router.navigate(['sevent', id]);
  }

  onSubmit(): void {
    console.log('All files ', this.selectedFiles);

    const formData: FormData = new FormData();

    for (let i = 0; i < this.selectedFiles.length; i++) {
      formData.append(
        'files[]',
        this.selectedFiles[i],
        this.selectedFiles[i].name
      );
    }

    console.log('Form data ', formData.get('files[]'));

    const newArticle: NewArticle = {
      title: this.form.get('title').value,
      content: this.form.get('content').value,
      author: this.form.get('author').value,
    };

    // console.log('New article ', newArticle);

    formData.append('newArticle', JSON.stringify(newArticle));

    console.log('data ', formData.get('newArticle'));
    console.log('files ', formData.get('files[]'));

    const eventId = +this.route.snapshot.paramMap.get('eventId');

    this.uploadService.upload(eventId, formData).subscribe(
      (res) => {
        this.showSuccess();
        this.router.navigate([
          'feedback',
          +this.route.snapshot.paramMap.get('facultyId'),
        ]);

        // const facultyId = +this.route.snapshot.paramMap.get('facultyId');
        // this.router.navigate(['sevent', facultyId]);
      },
      (err) => {
        this.showError();
        const facultyId = +this.route.snapshot.paramMap.get('facultyId');
        this.router.navigate(['sevent', facultyId]);
        // this.router.navigate([
        //   'feedback',
        //   +this.route.snapshot.paramMap.get('facultyId'),
        // ]);
      }
    );
  }

  selectFiles(event): void {
    this.selectedFiles = event.target.files;
    console.log('The selected files ', this.selectedFiles);
  }

  // Alert
  showSuccess(): void {
    this.toastr.success('Upload successfully!');
  }

  showError(): void {
    this.toastr.error('Upload failed!');
  }

  showLoading(): void {
    this.toastr.info('Loading...');
  }
}

export interface NewArticle {
  title: string;
  content: string;
  author: string;
}
