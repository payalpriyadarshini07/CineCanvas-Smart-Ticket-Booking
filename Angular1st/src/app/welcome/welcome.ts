import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome {

  constructor(private router: Router) {}

  customerLogin(): void {
    this.router.navigate(['/login']);
  }

  adminLogin(): void {
    this.router.navigate(['/admin-login']);
  }

  register(): void {
    this.router.navigate(['/register']);
  }
}