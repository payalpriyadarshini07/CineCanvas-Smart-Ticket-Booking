import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './admin-customers.html',
  styleUrl: './admin-customers.css'
})
export class AdminCustomers implements OnInit {

  customers: any[] = [];
  filteredCustomers: any[] = [];
  searchText = '';
  loading = true;
  errorMessage = '';

  private apiUrl = 'http://localhost:8081/api/auth/users';

constructor(
  private http: HttpClient,
  private cdr: ChangeDetectorRef
) {}
  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;

    this.http.get<any[]>(this.apiUrl).subscribe({
      next: data => {
        this.customers = data;
        this.filteredCustomers = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Customer API error:', error);
        this.errorMessage = 'Unable to load customers.';
        this.loading = false;
          this.cdr.detectChanges();

      }
    });
  }

  searchCustomers(): void {
    const search = this.searchText.toLowerCase().trim();

    this.filteredCustomers = this.customers.filter(customer =>
      customer.name?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.phone?.includes(search)
    );
  }
}