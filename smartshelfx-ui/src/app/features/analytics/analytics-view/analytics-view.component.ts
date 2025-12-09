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

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit(): void { this.loadStats(); }

  loadStats(): void {
    this.isLoading = true;
    this.analyticsService.getInventoryStats().subscribe({
      next: (stats: InventoryStats) => { this.stats = stats; this.prepareChartData(); this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  prepareChartData(): void {
    if (!this.stats) {
      this.chartData = [];
      return;
    }

    // Ensure we have valid data for chart
    const inStockCount = this.stats?.inStockCount || 0;
    const lowStockCount = this.stats?.lowStockCount || 0;
    const outOfStockCount = this.stats?.outOfStockCount || 0;

    // Only include items with values > 0 for better chart visibility
    this.chartData = [];
    if (inStockCount > 0) this.chartData.push({ name: 'In Stock', value: inStockCount });
    if (lowStockCount > 0) this.chartData.push({ name: 'Low Stock', value: lowStockCount });
    if (outOfStockCount > 0) this.chartData.push({ name: 'Out of Stock', value: outOfStockCount });

    // If all are 0, add a dummy entry so chart is visible
    if (this.chartData.length === 0) {
      this.chartData = [
        { name: 'In Stock', value: 0 },
        { name: 'Low Stock', value: 0 },
        { name: 'Out of Stock', value: 0 }
      ];
    }
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
