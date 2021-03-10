import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-manager',
  templateUrl: './event-manager.component.html',
  styleUrls: ['./event-manager.component.css'],
})
export class EventManagerComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  events = [1, 2, 3, 4, 5, 6];
}
