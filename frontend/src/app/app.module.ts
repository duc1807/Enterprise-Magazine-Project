import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminComponent } from './components/admin/admin.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { LoginComponent } from './components/login/login.component';
import { MarketingLoginComponent } from './components/marketing-login/marketing-login.component';
import { UploadComponent } from './components/upload/upload.component';
import { RegisterComponent } from './components/register/register.component';
import { NavbarLoginComponent } from './components/navbar-login/navbar-login.component';
import { NavbarStudentComponent } from './components/navbar-student/navbar-student.component';
import { NavbarCoorComponent } from './components/navbar-coor/navbar-coor.component';
import { NavbarManagerComponent } from './components/navbar-manager/navbar-manager.component';
import { HomepageManagerComponent } from './components/homepage-manager/homepage-manager.component';
import { FacultyComponent } from './components/faculty/faculty.component';
import { EventManagerComponent } from './components/event-manager/event-manager.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { DetailEventComponent } from './components/detail-event/detail-event.component';
import { HomepageCoorComponent } from './components/homepage-coor/homepage-coor.component';
import { EventCoorComponent } from './components/event-coor/event-coor.component';
import { ArticleManageComponent } from './components/article-manage/article-manage.component';

// Google login module
import {
  GoogleLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from 'angularx-social-login';
@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    HomepageComponent,
    LoginComponent,
    RegisterComponent,
    MarketingLoginComponent,
    AdminLoginComponent,
    AdminComponent,
    NavbarLoginComponent,
    NavbarStudentComponent,
    NavbarCoorComponent,
    NavbarManagerComponent,
    HomepageManagerComponent,
    FacultyComponent,
    EventManagerComponent,
    CreateEventComponent,
    DetailEventComponent,
    HomepageCoorComponent,
    EventCoorComponent,
    ArticleManageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SocialLoginModule,
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
