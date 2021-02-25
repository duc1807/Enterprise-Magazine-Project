import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadFilesComponent } from './components/upload-files/upload-files.component';

const routes: Routes = [
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
  { path: 'upload', component: UploadFilesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
