import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-post-article',
  templateUrl: './post-article.component.html',
  styleUrls: ['./post-article.component.css'],
})
export class PostArticleComponent implements OnInit {
  form: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9.,][a-zA-Z0-9.:, ]+'),
      ]),
      content: new FormControl('', [
        Validators.required,
        // Validators.pattern('[a-zA-Z0-9.,][a-zA-Z0-9., ]+'),
        // Validators.pattern('^(?!\\s*$).+'),
      ]),
      author: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9.,][a-zA-Z0-9:., ]+$'),
      ]),
      // agreeTerm: new FormControl('', [Validators.required]),
      image: new FormControl('', [Validators.required]),
    });
  }

  routerBack(): void {
    const id = +this.route.snapshot.paramMap.get('facultyId');
    console.log('Id from the url ', id);
    this.router.navigate(['post', id]);
  }

  onSubmit(): void {
    const id = +this.route.snapshot.paramMap.get('eventId');

    const formData: FormData = new FormData();

    const newPost: NewPost = {
      title: this.form.get('title').value,
      content: this.form.get('content').value,
      author: this.form.get('author').value,
    };

    // console.log(newPost);

    // Append image
    formData.append('image', this.form.get('image').value);
    // Append newEvent
    formData.append('newPost', JSON.stringify(newPost));

    this.articleService.addNewPost(id, formData).subscribe((res) => {
      console.log(res);
    });
  }

  setImage(event): void {
    const file = event.target.files[0];
    this.form.get('image').setValue(file);
  }
}

export interface NewPost {
  title: string;
  content: string;
  author: string;
}
