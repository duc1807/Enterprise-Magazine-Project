import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { HomepageComponent } from './student/homepage/homepage.component';
import { LoginComponent } from './components/login/login.component';
import { UploadComponent } from './student/upload/upload.component';

import { NavbarLoginComponent } from './components/navbar-login/navbar-login.component';
import { NavbarStudentComponent } from './student/navbar-student/navbar-student.component';
import { NavbarCoorComponent } from './coordinator/navbar-coor/navbar-coor.component';
import { NavbarManagerComponent } from './manager/navbar-manager/navbar-manager.component';
import { FacultyComponent } from './manager/faculty/faculty.component';
import { EventManagerComponent } from './manager/event-manager/event-manager.component';
import { CreateEventComponent } from './manager/create-event/create-event.component';
import { DetailEventComponent } from './manager/detail-event/detail-event.component';
import { HomepageCoorComponent } from './coordinator/homepage-coor/homepage-coor.component';
import { EventCoorComponent } from './coordinator/event-coor/event-coor.component';
import { ArticleManageComponent } from './coordinator/article-manage/article-manage.component';

// Google login module
import {
  GoogleLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from 'angularx-social-login';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ArticleFeedbackComponent } from './student/article-feedback/article-feedback.component';
import { ChartComponent } from './manager/chart/chart.component';
import { ChartsModule } from 'ng2-charts';
import { UserManageComponent } from './admin/user-manage/user-manage.component';
import { NavbarAdminComponent } from './admin/navbar-admin/navbar-admin.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { FacultyNamePipe } from './admin/faculty-name.pipe';
import { StatusPipe } from './admin/status.pipe';
import { PostArticleComponent } from './coordinator/post-article/post-article.component';

import { MatButtonModule } from '@angular/material/button';
import { FrontPageComponent } from './components/front-page/front-page.component';
import { ViewArticleComponent } from './components/view-article/view-article.component';
import { MoreArticleComponent } from './components/more-article/more-article.component';
import { AccountComponent } from './components/account/account.component';

// Alert module
import { ToastrModule } from 'ngx-toastr';
import { EventStudentComponent } from './student/event-student/event-student.component';
import { RoundupPipe } from './pipes/roundup.pipe';
import { IsCommentedPipe } from './pipes/is-commented.pipe';
import { DayLeftPipe } from './pipes/day-left.pipe';
import { RoleNamePipe } from './pipes/role-name.pipe';
import { NavbarBeginManagerComponent } from './manager/navbar-begin-manager/navbar-begin-manager.component';
import { ShortenPipe } from './pipes/shorten.pipe';
import { HomepageGuestComponent } from './guest/homepage-guest/homepage-guest.component';
import { MoreArticleCoorComponent } from './coordinator/more-article-coor/more-article-coor.component';
import { EventPostComponent } from './coordinator/event-post/event-post.component';
import { EditArticleComponent } from './student/edit-article/edit-article.component';
import { NavbarGuestComponent } from './guest/navbar-guest/navbar-guest.component';
import { MoreArticleGuestComponent } from './guest/more-article-guest/more-article-guest.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MoreArticleStudentComponent } from './student/more-article-student/more-article-student.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    HomepageComponent,
    LoginComponent,

    AdminLoginComponent,
    NavbarLoginComponent,
    NavbarStudentComponent,
    NavbarCoorComponent,
    NavbarManagerComponent,
    FacultyComponent,
    EventManagerComponent,
    CreateEventComponent,
    DetailEventComponent,
    HomepageCoorComponent,
    EventCoorComponent,
    ArticleManageComponent,
    ArticleFeedbackComponent,
    ChartComponent,
    UserManageComponent,
    NavbarAdminComponent,
    FacultyNamePipe,
    StatusPipe,
    PostArticleComponent,

    FrontPageComponent,
    ViewArticleComponent,
    MoreArticleComponent,
    AccountComponent,
    EventStudentComponent,
    RoundupPipe,
    IsCommentedPipe,
    DayLeftPipe,
    RoleNamePipe,
    NavbarBeginManagerComponent,
    ShortenPipe,
    HomepageGuestComponent,
    MoreArticleCoorComponent,
    EventPostComponent,
    EditArticleComponent,
    NavbarGuestComponent,
    MoreArticleGuestComponent,
    MoreArticleStudentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    MatPaginatorModule,
    MatTableModule,
    ChartsModule,
    MatFormFieldModule,
    MatInputModule,

    // Form validatation
    NgBootstrapFormValidationModule.forRoot(),
    NgBootstrapFormValidationModule,
    ReactiveFormsModule,

    MatButtonModule,

    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    MatTabsModule,
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '701728448437-q5cultsjtf3hj42dbehh6dvfg15e9k3e.apps.googleusercontent.com'
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
