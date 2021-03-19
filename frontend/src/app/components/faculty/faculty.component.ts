import { Component, OnInit } from '@angular/core';

import { FacultyService } from '../../services/faculty.service';
import { Faculty } from '../../models/faculty.model';
import { SaveDataService } from '../../services/save-data.service';

@Component({
  selector: 'app-faculty',
  templateUrl: './faculty.component.html',
  styleUrls: ['./faculty.component.css'],
})
export class FacultyComponent implements OnInit {
  faculties: Faculty[];

  constructor(
    private facultyService: FacultyService,
    private saveDataService: SaveDataService
  ) {}

  ngOnInit(): void {
    this.getAllFaculties();
    // console.log(this.faculties);
  }

  getAllFaculties(): void {
    this.facultyService.getAllFaculties().subscribe((data) => {
      this.faculties = data.faculties;
      this.faculties.pop();
      console.log('All faculties ', this.faculties);
    });
  }

  setFaculty(value: number): void {
    this.saveDataService.setFaculty(value);
    console.log(this.saveDataService.getFaculty());
  }
}
