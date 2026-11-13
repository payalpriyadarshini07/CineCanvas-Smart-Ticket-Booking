import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  message = '';

  private apiUrl = 'http://localhost:8081/api/auth/register';

  constructor(private http: HttpClient) {}

  register(): void {

    if (
      !this.name ||
      !this.email ||
      !this.phone ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.message = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 6) {
      this.message = 'Password must contain at least 6 characters.';
      return;
    }

    const registrationData = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password
    };

    this.http.post<any>(this.apiUrl, registrationData).subscribe({
      next: (response) => {

  console.log('Registration API Success:', response);

  this.message = response.message || 'Registration successful!';

  this.name = '';
  this.email = '';
  this.phone = '';
  this.password = '';
  this.confirmPassword = '';
},
      error: (error) => {
  console.error('Registration API Error:', error);

  this.message =
    typeof error.error === 'string'
      ? error.error
      : error.error?.message || 'Registration failed. Please try again.';
}

    });
    
  }
  
}