
import { Routes } from '@angular/router';
import { AdminLogin } from './admin-login/admin-login';
import { MovieListComponent } from './movie-list/movie-list';
import { MovieDetails } from './movie-details/movie-details';
import { ShowList } from './show-list/show-list';
import { Admin } from './admin/admin';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Login } from './login/login';
import { Register } from './register/register';
import { Dashboard } from './dashboard/dashboard';
import { AdminBookings } from './admin-bookings/admin-bookings';
import { AdminCustomers } from './admin-customers/admin-customers';
import { Welcome } from './welcome/welcome';
import { Analytics } from './analytics/analytics';
import { SeatMap } from './seat-map/seat-map';

export const routes: Routes = [

  // Customer homepage
{path:'', component: Welcome},
  // Movie listing
  {
    path: 'movies',
    component: MovieListComponent
  },

  // Movie details
  {
    path: 'movies/:id',
    component: MovieDetails
  },

  // Movie showtimes
  {
    path: 'movies/:id/shows',
    component: ShowList
  },
  {
  path: 'seat-map',
  component: SeatMap
},

  // User login
  {
    path: 'login',
    component: Login
  },

  // User registration
  {
    path: 'register',
    component: Register
  },

  // Customer dashboard
  {
  path: 'user-dashboard',
  component: Dashboard
},
{ path: 'admin-login', component: AdminLogin },
{ path: 'admin-dashboard', component: AdminDashboard },
{ path: 'admin-bookings', component: AdminBookings },
{ path: 'admin', component: Admin },
{ path: 'admin-customers', component: AdminCustomers },


  // Module 4 Analytics
  {
  path: 'analytics',
  component: Analytics
},
{ path: 'ai', redirectTo: 'user-dashboard' },

  // Unknown routes
  {
    path: '**',
    redirectTo: 'movies'
  }

];





