import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { UploadFilesComponent } from './components/upload-files/upload-files.component';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent, UploadFilesComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
