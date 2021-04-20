import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SchoolEvent, TheEvent } from '../models/event.model';
import { HandleErrorService } from './handle-error.service';
import { map } from 'rxjs/operators';

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

  constructor(private http: HttpClient) {}

  ////////// Service for Manager //////////

  /** POST: add a new event to the server */
  //
  createEvent(formData: FormData): Observable<any> {
    // console.log('Data in formdata ', formData.get('newEvent'));
    // console.log('Files in formdata ', formData.get('image'));

    // const req = new HttpRequest('POST', this.eventUrl, formData);

    return this.http.post<any>(this.eventUrl, formData).pipe(
      map((res) => {
        return res;
      })
    );
  }

  /** DELETE: delete an event */
  //
  deleteEvent(id: number): Observable<any> {
    const url = `${this.eventUrl}/${id}`;
    console.log('Delete event API ', url);

    return this.http.delete<any>(url, this.httpOptions);
  }

  /** PUT: update an event */
  //
  updateEvent(eventId: number, event: SchoolEvent): Observable<any> {
    const url = `${this.eventUrl}/${eventId}`;
    console.log('Url cua update event ', url);

    return this.http.put<any>(url, event, this.httpOptions);
  }

  /** PATCH: publish an event */
  //
  publishEvent(eventId: number): Observable<any> {
    const url = `${this.eventUrl}/${eventId}/publish`;
    console.log('Url cua publish event ', url);

    return this.http.patch(url, this.httpOptions);
  }

  ////////// Service for users //////////

  /** GET all posted articles of an event */
  //
  getPosted(eventId: number): Observable<any> {
    const url = `${this.eventUrl}/${eventId}/all`;
    console.log('Get all posted articles API ', url);

    return this.http.get<any>(url, this.httpOptions);
  }

  getPublishedEvent(facultyId: number): Observable<any> {
    const url = `${this.eventUrl}/published?facultyId=${facultyId}`;
    console.log('Get all published API events ', url);

    return this.http.get<any>(url, this.httpOptions);
  }

  /** GET: get an event info */
  getEvent(eventId: number): Observable<any> {
    const url = `${this.eventUrl}/${eventId}`;
    console.log('Get an event info ', url);

    return this.http.get<any>(url, this.httpOptions);
  }

  ////////// Service for Coordinator //////////

  /** GET: get all submitted articles */
  getPending(id: number): Observable<any> {
    const url = `${this.eventUrl}/${id}/submitted-articles`;

    return this.http.get<any>(url, this.httpOptions);
  }

  /** GET: get all selected articles */
  getSelected(id: number): Observable<any> {
    const url = `${this.eventUrl}/${id}/selected-articles`;

    return this.http.get<any>(url, this.httpOptions);
  }

  /** GET: get all rejected articles */
  getRejected(id: number): Observable<any> {
    const url = `${this.eventUrl}/${id}/rejected-articles`;

    return this.http.get<any>(url, this.httpOptions);
  }
}
