import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminComponent } from './components/admin/admin.component';
import { ArticleManageComponent } from './components/article-manage/article-manage.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { DetailEventComponent } from './components/detail-event/detail-event.component';
import { EventCoorComponent } from './components/event-coor/event-coor.component';
import { EventManagerComponent } from './components/event-manager/event-manager.component';
import { FacultyComponent } from './components/faculty/faculty.component';
import { HomepageCoorComponent } from './components/homepage-coor/homepage-coor.component';
import { HomepageManagerComponent } from './components/homepage-manager/homepage-manager.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { LoginComponent } from './components/login/login.component';
import { MarketingLoginComponent } from './components/marketing-login/marketing-login.component';
import { UploadComponent } from './components/upload/upload.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'homepage', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'mlogin', component: MarketingLoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'adlogin', component: AdminLoginComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'manager', component: HomepageManagerComponent },
  { path: 'faculty', component: FacultyComponent },
  { path: 'mevent', component: EventManagerComponent },
  { path: 'createevent', component: CreateEventComponent },
  { path: 'detailevent', component: DetailEventComponent },
  { path: 'coor', component: HomepageCoorComponent },
  { path: 'cevent', component: EventCoorComponent },
  { path: 'articlemanage', component: ArticleManageComponent },
  { path: '**', component: AppComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
