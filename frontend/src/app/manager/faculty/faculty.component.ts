import { Component, OnInit } from '@angular/core';
import { FacultyService } from '../../services/faculty.service';
import { Faculty } from '../../models/faculty.model';

@Component({
  selector: 'app-faculty',
  templateUrl: './faculty.component.html',
  styleUrls: ['./faculty.component.css'],
})
export class FacultyComponent implements OnInit {
  faculties: Faculty[];

  constructor(private facultyService: FacultyService) {}

  ngOnInit(): void {
    this.getAllFaculties();
  }

  getAllFaculties(): void {
    this.facultyService.getAllFaculties().subscribe((data) => {
      this.faculties = data.faculties;
      console.log(this.faculties);
    });
  }
}
