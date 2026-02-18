import { Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	// add other routes here, for example:
	// { path: 'about', loadComponent: () => import('./Pages/about/about.component').then(m => m.AboutComponent) }
];
