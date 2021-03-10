import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-coor',
  templateUrl: './event-coor.component.html',
  styleUrls: ['./event-coor.component.css'],
})
export class EventCoorComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  events = [1, 2, 3, 4, 5, 6];
}
