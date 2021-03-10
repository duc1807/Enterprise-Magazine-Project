import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-detail-event',
  templateUrl: './detail-event.component.html',
  styleUrls: ['./detail-event.component.css'],
})
export class DetailEventComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  article = [1, 2, 3, 4, 5, 6, 7, 8, 9];
}
