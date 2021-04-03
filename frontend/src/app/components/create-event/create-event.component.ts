import { Component, OnInit } from '@angular/core';
import { SchoolEvent } from 'src/app/models/event.model';
import { EventService } from 'src/app/services/event.service';
import { SaveDataService } from '../../services/save-data.service';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css'],
})
export class CreateEventComponent implements OnInit {
  canSubmit = true;
  today = Date.now();
  startdate = Date;
  enddate = Date;

  constructor(
    private eventService: EventService,
    private saveDataService: SaveDataService
  ) {}

  ngOnInit(): void {
    console.log('Today ', this.today);
  }

  // split = this.startdate.split('-');
  // enddate = [parseInt(this.split[0]) + 1 + '', this.split[1], this.split[2]];
  // minenddate = this.enddate.join('-');

  submitEvent(tle, ctent, sDate, eDate): void {
    const newEvent: SchoolEvent = {
      title: tle,
      content: ctent,
      startDate: sDate,
      endDate: eDate,
      facultyId: this.saveDataService.getFaculty(),
    };

    // Test log the event
    console.log(newEvent);

    this.eventService.createEvent(newEvent).subscribe(() => {
      console.log('Event was sent!');
    });
  }
}

function formatDate() {
  let today;
  let d = new Date();
  let dd: any = d.getDate();
  let mm: any = d.getMonth() + 1;
  let yyyy = d.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  return (today = yyyy + '-' + mm + '-' + dd);
}

(function () {
  'use strict';
  window.addEventListener(
    'click',
    function () {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function (form) {
        form.addEventListener(
          'submit',
          function (event) {
            if (form.checkValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            }
            form.classList.add('was-validated');
          },
          false
        );
      });
    },
    false
  );
})();
