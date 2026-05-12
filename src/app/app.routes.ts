import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';
import { ReservasComponent } from './components/reservas/reservas';
import { ContactoComponent } from './components/contacto/contacto';

export const routes: Routes = [
  { path: '',         component: LandingComponent  },
  { path: 'reservas', component: ReservasComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: '**',       redirectTo: ''               }
];