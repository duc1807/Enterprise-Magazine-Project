import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FacultyService {
  private facultyUrl = 'http://localhost:5000/api/faculties'; // URL to web api

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  /** GET all faculty */
  getAllFaculties(): Observable<any> {
    return this.http.get<any>(this.facultyUrl, this.httpOptions);
  }

  /** GET events of a faculty */
  getEventsByFaculty(facultyId: number): Observable<any> {
    const url = `${this.facultyUrl}/${facultyId}`;
    console.log(url);

    return this.http.get<any>(url, this.httpOptions);
  }

  /** GET information of an event */
  getAnEventInfo(facultyId: number, eventId: number): Observable<any> {
    const url = `${this.facultyUrl}/${facultyId}/events/${eventId}/posted-articles`;

    return this.http.get<any>(url, this.httpOptions);
  }

  // ????
  /** getting event information and its posted articles */

  // ????
  /** getting new submissions of a faculty */
}
