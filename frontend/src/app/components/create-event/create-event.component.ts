import { splitAtColon } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css'],
})
export class CreateEventComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  today = formatDate();
  startdate = '';
  enddate = '';

  // split = this.startdate.split('-');
  // enddate = [parseInt(this.split[0]) + 1 + '', this.split[1], this.split[2]];
  // minenddate = this.enddate.join('-');
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
