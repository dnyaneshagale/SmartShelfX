import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { ForecastService } from '../../../core/services/forecast.service';
import { ProductService } from '../../../core/services/product.service';
import { DemandForecast, Product } from '../../../core/models';

@Component({
  selector: 'app-forecast-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule, MatTableModule, MatChipsModule, FormsModule, NgxChartsModule],
  templateUrl: './forecast-view.component.html',
  styleUrl: './forecast-view.component.scss'
})
export class ForecastViewComponent implements OnInit {
  forecasts: DemandForecast[] = [];
  products: Product[] = [];
  selectedProductId: number | null = null;
  selectedForecast: DemandForecast | null = null;
  isLoading = true;
  forecastChartData: any[] = [];
  colorScheme: Color = { name: 'vivid', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] };

  constructor(
    private forecastService: ForecastService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadForecasts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => this.products = products
    });
  }

  loadForecasts(): void {
    this.isLoading = true;
    this.forecastService.getAllForecasts().subscribe({
      next: (forecasts: DemandForecast[]) => {
        this.forecasts = forecasts;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onProductSelect(): void {
    if (this.selectedProductId) {
      this.forecastService.getForecast(this.selectedProductId).subscribe({
        next: (forecast: DemandForecast) => {
          this.selectedForecast = forecast;
          this.prepareForecastChart(forecast);
        }
      });
    }
  }

  prepareForecastChart(forecast: DemandForecast): void {
    if (forecast.trendData) {
      this.forecastChartData = [{
        name: 'Demand Forecast',
        series: forecast.trendData.map(point => ({ name: point.date, value: point.value }))
      }];
    }
  }

  generateForecast(): void {
    if (this.selectedProductId) {
      this.isLoading = true;
      this.forecastService.generateForecast({ productId: this.selectedProductId }).subscribe({
        next: (forecast: DemandForecast) => {
          this.selectedForecast = forecast;
          this.prepareForecastChart(forecast);
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  generateAllForecasts(): void {
    this.isLoading = true;
    this.forecastService.generateAllForecasts().subscribe({
      next: (forecasts: DemandForecast[]) => {
        this.forecasts = forecasts;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getConfidenceColor(score: number): string {
    if (score >= 80) return 'primary';
    if (score >= 60) return 'accent';
    return 'warn';
  }
}
