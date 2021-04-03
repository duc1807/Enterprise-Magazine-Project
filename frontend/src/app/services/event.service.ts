import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SchoolEvent, TheEvent } from '../models/event.model';
import { HandleErrorService } from './handle-error.service';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private eventUrl = 'http://localhost:5000/api/events'; // URL to web api

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  /** POST: add a new event to the server */
  createEvent(theNewEvent: SchoolEvent): Observable<any> {
    return this.http
      .post<any>(this.eventUrl, theNewEvent, this.httpOptions)
      .pipe(
        tap((newHero: any) => console.log(`Added event`)),
        catchError(this.handleErrorService.handleError<any>('createEvent'))
      );
  }

  /** GET an event info (for student only) */
  getEvent(id: number): Observable<any> {
    const url = `${this.eventUrl}/${id}`;

    return this.http.get<any>(url, this.httpOptions);
  }

  /** GET all articles of an event */
  getSubmittedArc(id: number): Observable<any> {
    const url = `${this.eventUrl}/${id}/submitted-articles`;

    return this.http.get<any>(url, this.httpOptions);
  }

  /** DELETE: delete and event */
  // Should use DELETE instead of POST??
  deleteAnEvent(event: TheEvent | number): Observable<any> {
    const id = typeof event === 'number' ? event : event.event_id;
    const url = `${this.eventUrl}/${id}`;

    return this.http.delete<any>(url, this.httpOptions).pipe(
      tap((_) => console.log(`Deleted hero id=${id}`)),
      catchError(this.handleErrorService.handleError<any>('deleteHero'))
    );
  }

  /** PUT: update event */
  // Should use PUT instead of POST??
  updateAnEvent(event: TheEvent): Observable<any> {
    const url = `${this.eventUrl}/update-event`;

    return this.http.put(url, event, this.httpOptions).pipe(
      tap((_) => console.log(`Updated event id=${event.event_id}`)),
      catchError(this.handleErrorService.handleError<any>('updateEvent'))
    );
  }
}
