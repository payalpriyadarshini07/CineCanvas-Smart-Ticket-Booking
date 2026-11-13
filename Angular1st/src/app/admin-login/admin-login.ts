import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {
  adminId = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

  login(): void {
  if (this.adminId === 'admin' && this.password === 'demo123') {
    sessionStorage.setItem('adminLoggedIn', 'true');
    this.router.navigate(['/admin-dashboard']);
  } else {
    this.errorMessage = 'Invalid Admin ID or Password.';
  }
}
}
