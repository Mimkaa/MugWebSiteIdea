// app.routes.ts
import { Routes } from '@angular/router';
import { RegistrationFormComponent } from './registration-form/registration-form.component';
import { HomeComponent } from './home/home.component';
import { EditorComponent } from './editor/editor.component';
import { CatalogComponent } from './catalog/catalog.component';

export const routes: Routes = [
  // This route displays the registration form.
  { path: 'register', component: RegistrationFormComponent },

  { path: 'home', component: HomeComponent },
  
  // Redirect the empty path to '/register'
  { path: '', redirectTo: 'register', pathMatch: 'full' },

  { path: 'editor/:cupId', component: EditorComponent },

  { path: 'home/catalogue', component: CatalogComponent },
  
  // Redirect any unknown paths to '/register'
  { path: '**', redirectTo: 'register' },

];
