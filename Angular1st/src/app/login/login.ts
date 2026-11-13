import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';
  message = '';

  private apiUrl = 'http://localhost:8081/api/auth/login';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(): void {

    if (!this.email || !this.password) {
      this.message = 'Please enter your email and password.';
      return;
    }

    const loginData = {
      email: this.email,
      password: this.password
    };
console.log('Sending login request:', {
  email: this.email,
  passwordEntered: !!this.password
});
    this.http.post<any>(this.apiUrl, loginData).subscribe({

      next: (response) => {

        console.log('Login successful:', response);

        sessionStorage.setItem('userId', response.id.toString());
        sessionStorage.setItem('userName', response.name);
        sessionStorage.setItem('userEmail', response.email);
        sessionStorage.setItem('userPhone', response.phone || '');

        this.router.navigate(['/user-dashboard']);
      },

      error: (error) => {

        console.error('Login API Error:', error);

        this.message =
          typeof error.error === 'string'
            ? error.error
            : error.error?.message || 'Invalid email or password.';
      }

    });
  }
}