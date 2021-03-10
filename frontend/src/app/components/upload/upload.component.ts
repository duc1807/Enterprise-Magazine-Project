import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UploadFileService } from 'src/app/services/upload-file.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit {
  selectedFiles: FileList;
  progressInfos = [];
  message = '';

  fileInfos: Observable<any>;

  constructor(private uploadService: UploadFileService) {}

  ngOnInit(): void {
    this.fileInfos = this.uploadService.getFiles();
  }

  selectFiles(event): void {
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
  }

  uploadFiles(): void {
    this.message = '';

    for (let i = 0; i < this.selectedFiles.length; i++) {
      this.upload(i, this.selectedFiles[i]);
    }
  }

  upload(idx, file): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    this.uploadService.upload(file).subscribe((event) => {
      if (typeof event === 'object') {
        for (let i = 0; i < this.selectedFiles.length; i++) {
          this.message =
            this.selectedFiles.length + ' file(s) successfully uploaded';
        }
      } else {
        // this.fileInfos = this.uploadService.getFiles();
        this.message = 'Could not upload this file';
      }
      // if (this.selectFiles.length == 0) {
      //   this.message = 'Couldnt upload this file';
      // } else {
      //   this.message = file.name + ' successfully uploaded';
      // }
    });
  }
}
