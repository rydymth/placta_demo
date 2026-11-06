import { Routes } from '@angular/router';
import { PublicPageComponent } from './public-page';

export const routes: Routes = [
  { path: '', component: PublicPageComponent },
  { path: ':slug', component: PublicPageComponent },
  { path: '**', component: PublicPageComponent },
];
