import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Module4Service,
  AnalyticsSummary
} from '../services/module4.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class Analytics implements OnInit {
  private readonly module4Service = inject(Module4Service);

  summary: AnalyticsSummary | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = '';

    this.module4Service.getAnalyticsSummary().subscribe({
      next: (data) => {
        console.log('ANALYTICS RESPONSE:', data);
        this.summary = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('ANALYTICS ERROR:', err);
        this.error = 'Unable to load analytics data.';
        this.loading = false;
      }
    });
  }
}

