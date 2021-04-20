import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { ArticleFeedbackComponent } from './student/article-feedback/article-feedback.component';
import { ArticleManageComponent } from './coordinator/article-manage/article-manage.component';
import { ChartComponent } from './manager/chart/chart.component';
import { CreateEventComponent } from './manager/create-event/create-event.component';
import { DetailEventComponent } from './manager/detail-event/detail-event.component';
import { EventCoorComponent } from './coordinator/event-coor/event-coor.component';
import { EventManagerComponent } from './manager/event-manager/event-manager.component';
import { FacultyComponent } from './manager/faculty/faculty.component';
import { HomepageCoorComponent } from './coordinator/homepage-coor/homepage-coor.component';
import { HomepageComponent } from './student/homepage/homepage.component';
import { LoginComponent } from './components/login/login.component';
import { UploadComponent } from './student/upload/upload.component';
import { UserManageComponent } from './admin/user-manage/user-manage.component';
import { PostArticleComponent } from './coordinator/post-article/post-article.component';
import { EventStudentComponent } from './student/event-student/event-student.component';
import { AccountComponent } from './components/account/account.component';
import { HomepageGuestComponent } from './guest/homepage-guest/homepage-guest.component';
import { MoreArticleCoorComponent } from './coordinator/more-article-coor/more-article-coor.component';
import { ViewArticleComponent } from './components/view-article/view-article.component';
import { EventPostComponent } from './coordinator/event-post/event-post.component';
import { EditArticleComponent } from './student/edit-article/edit-article.component';
import { MoreArticleGuestComponent } from './guest/more-article-guest/more-article-guest.component';
import { MoreArticleStudentComponent } from './student/more-article-student/more-article-student.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'account', component: AccountComponent },
  { path: 'login', component: LoginComponent },
  { path: 'article/:articleId', component: ViewArticleComponent },

  /* Student routing */
  { path: 'homepage/:facultyId', component: HomepageComponent },
  {
    path: 'homepage/:facultyId/more_articles/:eventId',
    component: MoreArticleStudentComponent,
  },
  { path: 'sevent/:facultyId', component: EventStudentComponent },
  { path: 'sevent/:facultyId/upload/:eventId', component: UploadComponent },
  { path: 'feedback/:facultyId', component: ArticleFeedbackComponent },
  {
    path: 'feedback/:facultyId/edit_article/:articleId',
    component: EditArticleComponent,
  },

  /* Manager routing */
  { path: 'faculty', component: FacultyComponent },
  { path: 'statistic', component: ChartComponent },
  { path: 'mevent/:facultyId', component: EventManagerComponent },
  { path: 'mevent/:facultyId/createevent', component: CreateEventComponent },
  {
    path: 'mevent/:facultyId/detail/:eventId',
    component: DetailEventComponent,
  },
  { path: 'statistic', component: ChartComponent },

  /* Coordinator routing */
  { path: 'coor/:facultyId', component: HomepageCoorComponent },
  {
    path: 'coor/:facultyId/more_articles/:eventId',
    component: MoreArticleCoorComponent,
  },
  { path: 'cevent/:facultyId', component: EventCoorComponent },
  {
    path: 'cevent/:facultyId/articlemanage/:eventId',
    component: ArticleManageComponent,
  },
  { path: 'post/:facultyId', component: EventPostComponent },
  { path: 'post/:facultyId/event/:eventId', component: PostArticleComponent },

  /* Guest routing */
  { path: 'guest/:facultyId', component: HomepageGuestComponent },
  {
    path: 'guest/:facultyId/more_articles/:eventId',
    component: MoreArticleGuestComponent,
  },

  /* Admin routing */
  { path: 'adlogin', component: AdminLoginComponent },
  { path: 'user', component: UserManageComponent },

  { path: '**', component: AppComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
