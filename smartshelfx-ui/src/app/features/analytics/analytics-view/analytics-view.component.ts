import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { InventoryStats } from '../../../core/models';

@Component({
  selector: 'app-analytics-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, NgxChartsModule],
  templateUrl: './analytics-view.component.html',
  styleUrl: './analytics-view.component.scss'
})
export class AnalyticsViewComponent implements OnInit {
  isLoading = true;
  stats: InventoryStats | null = null;
  chartData: any[] = [];
  colorScheme: Color = { name: 'custom', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void { this.loadStats(); }

  loadStats(): void {
    this.isLoading = true;
    this.analyticsService.getInventoryStats().subscribe({
      next: (stats: InventoryStats) => { this.stats = stats; this.prepareChartData(); this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  prepareChartData(): void {
    this.chartData = [
      { name: 'In Stock', value: this.stats?.inStockCount || 0 },
      { name: 'Low Stock', value: this.stats?.lowStockCount || 0 },
      { name: 'Out of Stock', value: this.stats?.outOfStockCount || 0 }
    ];
  }

  exportPdf(): void {
    this.analyticsService.exportPdfReport().subscribe({
      next: (blob: Blob) => { const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'inventory-report.pdf'; a.click(); }
    });
  }

  exportExcel(): void {
    this.analyticsService.exportExcelReport().subscribe({
      next: (blob: Blob) => { const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'inventory-report.xlsx'; a.click(); }
    });
  }
}
