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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { ForecastService } from '../../../core/services/forecast.service';
import { ProductService } from '../../../core/services/product.service';
import { DemandForecast, Product } from '../../../core/models';

@Component({
  selector: 'app-forecast-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule, MatTableModule, MatChipsModule, MatSnackBarModule, FormsModule, NgxChartsModule],
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
    private productService: ProductService,
    private snackBar: MatSnackBar
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
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error loading forecasts', 'Close', { duration: 3000 });
      }
    });
  }

  onProductSelect(): void {
    if (this.selectedProductId) {
      this.isLoading = true;
      this.forecastService.getForecast(this.selectedProductId).subscribe({
        next: (forecast: DemandForecast) => {
          this.selectedForecast = forecast;
          this.prepareForecastChart(forecast);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          // No forecast exists yet - prompt to generate
          this.selectedForecast = null;
          this.snackBar.open('No forecast available. Click "Generate Forecast" to create one.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  prepareForecastChart(forecast: DemandForecast): void {
    if (forecast.trendData && forecast.trendData.length > 0) {
      this.forecastChartData = [{
        name: 'Demand Forecast',
        series: forecast.trendData.map(point => ({ name: point.date, value: point.value }))
      }];
    } else {
      // Create a simple chart based on current data
      this.forecastChartData = [{
        name: 'Stock vs Demand',
        series: [
          { name: 'Current Stock', value: forecast.currentStock },
          { name: 'Predicted Demand', value: forecast.predictedDemand },
          { name: 'Recommended Restock', value: forecast.recommendedRestock || 0 }
        ]
      }];
    }
  }

  generateForecast(): void {
    if (this.selectedProductId) {
      this.isLoading = true;
      this.forecastService.generateForecast({ productId: this.selectedProductId }).subscribe({
        next: (forecast: any) => {
          // Map the response to our model
          this.selectedForecast = {
            productId: forecast.productId,
            productName: forecast.productName,
            currentStock: forecast.currentStock,
            predictedDemand: forecast.summary?.totalPredictedDemand || 0,
            recommendedRestock: forecast.summary?.recommendedRestock || 0,
            confidenceScore: forecast.overallConfidence || 0.75,
            forecastDate: new Date(),
            daysUntilStockout: forecast.summary?.daysUntilStockout,
            riskLevel: forecast.summary?.riskAssessment,
            suggestedAction: forecast.summary?.recommendations?.[0]
          };
          this.prepareForecastChart(this.selectedForecast);
          this.loadForecasts(); // Refresh the list
          this.isLoading = false;
          this.snackBar.open('Forecast generated successfully', 'Close', { duration: 3000 });
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Error generating forecast', 'Close', { duration: 3000 });
        }
      });
    }
  }

  generateAllForecasts(): void {
    this.isLoading = true;
    this.forecastService.generateAllForecasts().subscribe({
      next: (forecasts: any[]) => {
        this.loadForecasts(); // Refresh the list with saved forecasts
        this.snackBar.open(`Generated ${forecasts.length} forecasts`, 'Close', { duration: 3000 });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error generating forecasts', 'Close', { duration: 3000 });
      }
    });
  }

  getConfidenceColor(score: number): string {
    const scorePercent = score > 1 ? score : score * 100;
    if (scorePercent >= 80) return 'primary';
    if (scorePercent >= 60) return 'accent';
    return 'warn';
  }

  getRiskColor(riskLevel: string): string {
    switch (riskLevel?.toUpperCase()) {
      case 'LOW': return 'primary';
      case 'MEDIUM': return 'accent';
      case 'HIGH':
      case 'CRITICAL': return 'warn';
      default: return 'primary';
    }
  }
}
