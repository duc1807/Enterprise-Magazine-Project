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

  ////////// Service for Manager //////////

  /** GET all faculties */
  // done
  getAllFaculties(): Observable<any> {
    return this.http.get<any>(this.facultyUrl, this.httpOptions);
  }

  ////////// Service for users //////////

  /** GET events of a faculty */
  // done
  getEventsByFaculty(facultyId: number): Observable<any> {
    const url = `${this.facultyUrl}/${facultyId}`;
    console.log('Get events by faculty ', url);

    return this.http.get<any>(url, this.httpOptions);
  }

  /** GET information of an event */
  //
  getAnEventInfo(facultyId: number, eventId: number): Observable<any> {
    const url = `${this.facultyUrl}/${facultyId}/events/${eventId}/posted-articles`;

    return this.http.get<any>(url, this.httpOptions);
  }
}
