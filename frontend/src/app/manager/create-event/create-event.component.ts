import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { SchoolEvent } from '../../models/event.model';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css'],
})
export class CreateEventComponent implements OnInit {
  today = new Date();
  startdate;
  enddate;

  // Validate
  form: FormGroup;

  // Alert
  showSuccess(): void {
    this.toastr.success('Add event successfully!');
  }

  showError(): void {
    this.toastr.error('Create event failed!');
  }

  showLoading(): void {
    this.toastr.info('Loading...');
  }

  constructor(
    private eventService: EventService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // this.form = new FormGroup({
    //   title: new FormControl('', [
    //     Validators.required,
    //     Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9.,]+'),
    //     Validators.min(2),
    //     Validators.max(50),
    //   ]),
    //   content: new FormControl('', [
    //     Validators.required,
    //     Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9.,]+'),
    //     Validators.min(3),
    //   ]),
    //   startDate: new FormControl('', [Validators.required]),
    //   endDate: new FormControl('', [Validators.required]),
    //   updateDate: new FormControl('', [Validators.required]),
    //   image: new FormControl('', [Validators.required]),
    // });

    this.form = this.fb.group({
      title: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9., ]+'),
        Validators.min(2),
        Validators.max(50),
      ]),
      content: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9., ]+'),
        Validators.min(3),
      ]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      updateDate: new FormControl('', [Validators.required]),
      image: new FormControl('', [Validators.required]),
    });

    console.log(new Date());
  }

  onFileSelect(event): void {
    const file = event.target.files[0];
    this.form.get('image').setValue(file);
  }

  submitEvent(): void {
    const formData: FormData = new FormData();

    // Create new event
    const newEvent: SchoolEvent = new SchoolEvent(
      this.form.get('title').value,
      this.form.get('content').value,
      this.form.get('startDate').value,
      this.form.get('endDate').value,
      this.form.get('updateDate').value,
      +this.route.snapshot.paramMap.get('facultyId')
    );
    console.log('The newEvent ', newEvent);

    // Append image
    formData.append('image', this.form.get('image').value);
    // Append newEvent
    formData.append('newEvent', JSON.stringify(newEvent));

    console.log('This is the image ', formData.get('image'));
    console.log('This is the event ', formData.get('newEvent'));

    this.eventService.createEvent(formData).subscribe(
      (res: HttpResponse<any>) => {
        console.log('Data tra ve ', res.status);
        if (res.status === 201) {
          this.showSuccess();
          this.router.navigate([
            'mevent',
            +this.route.snapshot.paramMap.get('facultyId'),
          ]);
        } else if (res.status !== undefined && res.status !== 201) {
          this.showError();
          this.router.navigate([
            'mevent',
            +this.route.snapshot.paramMap.get('facultyId'),
            'createevent',
          ]);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  routerBack(): void {
    const id = +this.route.snapshot.paramMap.get('facultyId');
    console.log('Id from the url ', id);
    this.router.navigate(['mevent', id]);
  }
}
