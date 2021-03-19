import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SaveDataService {
  private currentFaculty: number;
  private currentEvent: number;
  private currentUser: any;

  public getFaculty(): number {
    return this.currentFaculty;
  }

  public setFaculty(value: number): void {
    this.currentFaculty = value;
  }

  public clearFaculty(): void {
    this.currentFaculty = undefined;
  }

  public getEvent(): number {
    return this.currentEvent;
  }

  public setEvent(value: number): void {
    this.currentEvent = value;
  }

  public clearEvent(): void {
    this.currentEvent = undefined;
  }

  public getUser(): any {
    return this.currentUser;
  }

  public setUser(data: any): void {
    this.currentUser = data;
  }

  public clearUser(): void {
    this.currentUser = undefined;
  }

  public clearAllData(): void {
    this.clearFaculty();
    this.clearEvent();
    this.clearUser();
  }
}
