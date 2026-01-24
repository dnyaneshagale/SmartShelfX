import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { DashboardService } from '../../../services/dashboard.service';
import { StockService } from '../../../services/stock.service';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import * as XLSX from 'xlsx';

Chart.register(...registerables);

interface ReportData {
  label: string;
  value: number;
  change?: number;
  color?: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    BaseChartDirective
  ],
  template: `
    <div class="reports">
      <div class="header">
        <h1>Reports & Analytics</h1>
        <div class="actions">
          <mat-form-field appearance="outline" class="date-range">
            <mat-label>Date Range</mat-label>
            <mat-select [(ngModel)]="dateRange" (selectionChange)="loadReports()">
              <mat-option value="7d">Last 7 Days</mat-option>
              <mat-option value="30d">Last 30 Days</mat-option>
              <mat-option value="90d">Last 90 Days</mat-option>
              <mat-option value="1y">Last Year</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="exportReport()">
            <mat-icon>download</mat-icon>
            Export
          </button>
        </div>
      </div>

      <mat-tab-group>
        <mat-tab label="Overview">
          <div class="tab-content">
            <div class="kpi-grid">
              <mat-card class="kpi-card">
                <mat-card-content>
                  <mat-icon class="kpi-icon revenue">trending_up</mat-icon>
                  <div class="kpi-info">
                    <p class="kpi-label">Total Revenue</p>
                    <h2 class="kpi-value">\${{totalRevenue | number:'1.2-2'}}</h2>
                    <span class="kpi-change" [class.positive]="revenueChange > 0" [class.negative]="revenueChange < 0">
                      {{revenueChange > 0 ? '+' : ''}}{{revenueChange}}%
                    </span>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="kpi-card">
                <mat-card-content>
                  <mat-icon class="kpi-icon orders">shopping_cart</mat-icon>
                  <div class="kpi-info">
                    <p class="kpi-label">Total Orders</p>
                    <h2 class="kpi-value">{{totalOrders}}</h2>
                    <span class="kpi-change" [class.positive]="ordersChange > 0" [class.negative]="ordersChange < 0">
                      {{ordersChange > 0 ? '+' : ''}}{{ordersChange}}%
                    </span>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="kpi-card">
                <mat-card-content>
                  <mat-icon class="kpi-icon stock">inventory</mat-icon>
                  <div class="kpi-info">
                    <p class="kpi-label">Stock Turnover</p>
                    <h2 class="kpi-value">{{stockTurnover}}x</h2>
                    <span class="kpi-change" [class.positive]="turnoverChange > 0" [class.negative]="turnoverChange < 0">
                      {{turnoverChange > 0 ? '+' : ''}}{{turnoverChange}}x
                    </span>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="kpi-card">
                <mat-card-content>
                  <mat-icon class="kpi-icon efficiency">speed</mat-icon>
                  <div class="kpi-info">
                    <p class="kpi-label">Order Fulfillment</p>
                    <h2 class="kpi-value">{{orderFulfillment}}%</h2>
                    <span class="kpi-change" [class.positive]="fulfillmentChange > 0" [class.negative]="fulfillmentChange < 0">
                      {{fulfillmentChange > 0 ? '+' : ''}}{{fulfillmentChange}}%
                    </span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="charts-row">
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Stock Movement Trend</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-wrapper">
                    <canvas baseChart
                      [data]="stockMovementData"
                      [options]="stockMovementOptions"
                      [type]="'line'">
                    </canvas>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Order Status Distribution</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-wrapper">
                    <canvas baseChart
                      [data]="orderStatusData"
                      [options]="orderStatusOptions"
                      [type]="'pie'">
                    </canvas>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Inventory">
          <div class="tab-content">
            <div class="metrics-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Stock by Category</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="metric-list">
                    @for (item of categoryData; track item.label) {
                      <div class="metric-item">
                        <div class="metric-label">
                          <span class="category-dot" [style.background]="item.color"></span>
                          {{item.label}}
                        </div>
                        <div class="metric-value">{{item.value}} units</div>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>Low Stock Alerts</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @if (lowStockAlerts.length === 0) {
                    <div class="no-data">
                      <mat-icon>check_circle</mat-icon>
                      <p>All stock levels are adequate</p>
                    </div>
                  } @else {
                    <div class="alert-list">
                      @for (alert of lowStockAlerts; track alert.productName) {
                        <div class="alert-item">
                          <mat-icon class="alert-icon">warning</mat-icon>
                          <div class="alert-info">
                            <h4>{{alert.productName}}</h4>
                            <p>Current: {{alert.currentStock}} / Reorder: {{alert.reorderLevel}}</p>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Vendors">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Vendor Performance</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                @if (vendorPerformance.length === 0) {
                  <div class="no-data">
                    <mat-icon>info</mat-icon>
                    <p>No vendor data available</p>
                  </div>
                } @else {
                  <div class="table-container">
                    <table class="performance-table">
                      <thead>
                        <tr>
                          <th>Vendor</th>
                          <th>Products</th>
                          <th>Orders</th>
                          <th>Fulfillment Rate</th>
                          <th>Avg Response Time</th>
                          <th>Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (vendor of vendorPerformance; track vendor.name) {
                          <tr>
                            <td>{{vendor.name}}</td>
                            <td>{{vendor.products}}</td>
                            <td>{{vendor.orders}}</td>
                            <td>
                              <span [class]="getRateClass(vendor.fulfillmentRate)">
                                {{vendor.fulfillmentRate}}%
                              </span>
                            </td>
                            <td>{{vendor.avgResponseTime}}</td>
                            <td>
                              <div class="rating">
                                @for (star of [1,2,3,4,5]; track star) {
                                  <mat-icon [class.filled]="star <= vendor.rating">star</mat-icon>
                                }
                              </div>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Purchase Orders">
          <div class="tab-content">
            <div class="po-stats-grid">
              <mat-card class="po-stat-card">
                <mat-card-content>
                  <h3>{{poStats.total}}</h3>
                  <p>Total Orders</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="po-stat-card pending">
                <mat-card-content>
                  <h3>{{poStats.pending}}</h3>
                  <p>Pending</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="po-stat-card approved">
                <mat-card-content>
                  <h3>{{poStats.approved}}</h3>
                  <p>Approved</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="po-stat-card rejected">
                <mat-card-content>
                  <h3>{{poStats.rejected}}</h3>
                  <p>Rejected</p>
                </mat-card-content>
              </mat-card>
            </div>

            <mat-card>
              <mat-card-header>
                <mat-card-title>Recent Purchase Orders</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="table-container">
                  <table class="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Product</th>
                        <th>Vendor</th>
                        <th>Quantity</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (order of recentOrders; track order.id) {
                        <tr>
                          <td>#{{order.id}}</td>
                          <td>{{order.product?.name || order.productName || 'N/A'}}</td>
                          <td>{{order.vendor?.fullName || order.vendor?.username || order.vendorName || 'N/A'}}</td>
                          <td>{{order.quantity}}</td>
                          <td>{{(order.createdAt || order.date) | date:'short'}}</td>
                          <td>
                            <span class="status-badge" [class]="'status-' + order.status.toLowerCase()">
                              {{order.status}}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .reports {
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #667eea;
    }

    .actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .date-range {
      width: 200px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
    }

    .kpi-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      padding: 12px;
      background: #f5f5f5;
    }

    .kpi-icon.revenue {
      color: #4caf50;
      background: #e8f5e9;
    }

    .kpi-icon.orders {
      color: #2196f3;
      background: #e3f2fd;
    }

    .kpi-icon.stock {
      color: #ff9800;
      background: #fff3e0;
    }

    .kpi-icon.efficiency {
      color: #9c27b0;
      background: #f3e5f5;
    }

    .kpi-info {
      flex: 1;
    }

    .kpi-label {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .kpi-value {
      margin: 8px 0;
      font-size: 32px;
      font-weight: 600;
    }

    .kpi-change {
      font-size: 14px;
      font-weight: 500;
    }

    .kpi-change.positive {
      color: #4caf50;
    }

    .kpi-change.negative {
      color: #f44336;
    }

    .charts-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 16px;
    }

    .chart-card {
      height: 400px;
    }

    .chart-wrapper {
      height: 300px;
      position: relative;
    }

    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .chart-placeholder mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #667eea;
      margin-bottom: 16px;
    }

    .chart-placeholder p {
      font-size: 18px;
      font-weight: 500;
      margin: 0;
    }

    .chart-placeholder small {
      color: #666;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .metric-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .metric-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .metric-value {
      font-weight: 600;
    }

    .alert-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alert-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #fff3e0;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
    }

    .alert-icon {
      color: #ff9800;
    }

    .alert-info h4 {
      margin: 0;
      font-size: 14px;
    }

    .alert-info p {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #666;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .no-data p {
      margin: 0;
      font-size: 16px;
    }

    .table-container {
      overflow-x: auto;
    }

    .performance-table,
    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .performance-table th,
    .performance-table td,
    .orders-table th,
    .orders-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .performance-table th,
    .orders-table th {
      background: #f5f5f5;
      font-weight: 600;
    }

    .rate-high {
      color: #4caf50;
      font-weight: 600;
    }

    .rate-medium {
      color: #ff9800;
      font-weight: 600;
    }

    .rate-low {
      color: #f44336;
      font-weight: 600;
    }

    .rating {
      display: flex;
      gap: 4px;
    }

    .rating mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #ddd;
    }

    .rating mat-icon.filled {
      color: #ffc107;
    }

    .po-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .po-stat-card mat-card-content {
      text-align: center;
      padding: 24px;
    }

    .po-stat-card h3 {
      margin: 0;
      font-size: 36px;
      font-weight: 600;
    }

    .po-stat-card p {
      margin: 8px 0 0 0;
      color: #666;
    }

    .po-stat-card.pending {
      border-left: 4px solid #ff9800;
    }

    .po-stat-card.approved {
      border-left: 4px solid #4caf50;
    }

    .po-stat-card.rejected {
      border-left: 4px solid #f44336;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.status-pending {
      background: #fff3e0;
      color: #f57c00;
    }

    .status-badge.status-approved {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.status-rejected {
      background: #ffebee;
      color: #c62828;
    }

    @media (max-width: 768px) {
      .kpi-grid,
      .charts-row {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column;
        align-items: stretch;
      }

      .date-range {
        width: 100%;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  dateRange: string = '30d';
  totalOrders: number = 0;
  totalRevenue: number = 0;
  stockTurnover: number = 0;
  orderFulfillment: number = 0;
  revenueChange: number = 0;
  ordersChange: number = 0;
  turnoverChange: number = 0;
  fulfillmentChange: number = 0;

  categoryData: ReportData[] = [];
  lowStockAlerts: any[] = [];
  vendorPerformance: any[] = [];

  poStats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  };

  recentOrders: any[] = [];

  // Stock Movement Chart Data
  stockMovementData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Stock In',
        data: [],
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Stock Out',
        data: [],
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  stockMovementOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  // Order Status Pie Chart Data
  orderStatusData: ChartData<'pie'> = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        '#ff9800',
        '#4caf50',
        '#f44336'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  orderStatusOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private stockService: StockService,
    private purchaseOrderService: PurchaseOrderService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    // Load comprehensive report stats
    this.dashboardService.getReportStats().subscribe({
      next: (stats: any) => {
        // Update KPIs
        this.totalRevenue = stats.totalRevenue || 0;
        this.totalOrders = stats.totalOrders || 0;
        this.stockTurnover = stats.stockTurnover || 0;
        this.orderFulfillment = stats.orderFulfillmentRate || 0;
        
        // Mock change percentages (can be calculated from historical data)
        this.revenueChange = 12.5;
        this.ordersChange = 8.2;
        this.turnoverChange = 0.3;
        this.fulfillmentChange = -2.1;
        
        // Update category data
        if (stats.categoryStock) {
          const colors = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#f44336', '#00bcd4'];
          let colorIndex = 0;
          this.categoryData = Object.entries(stats.categoryStock).map(([label, value]: [string, any]) => ({
            label,
            value: value as number,
            color: colors[colorIndex++ % colors.length]
          }));
        }
        
        // Update low stock alerts
        this.lowStockAlerts = stats.lowStockAlerts || [];
        
        // Update vendor performance
        this.vendorPerformance = stats.vendorPerformance || [];
        
        // Update order stats
        if (stats.orderStats) {
          this.poStats = {
            total: stats.orderStats.total || 0,
            pending: stats.orderStats.pending || 0,
            approved: stats.orderStats.approved || 0,
            rejected: stats.orderStats.rejected || 0
          };
          
          // Update Order Status Pie Chart
          this.orderStatusData = {
            labels: ['Pending', 'Approved', 'Rejected'],
            datasets: [{
              data: [
                this.poStats.pending,
                this.poStats.approved,
                this.poStats.rejected
              ],
              backgroundColor: ['#ff9800', '#4caf50', '#f44336'],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          };
        }
      },
      error: (error) => console.error('Error loading report stats:', error)
    });

    // Load stock transactions for movement chart
    this.stockService.getAllTransactions().subscribe({
      next: (transactions) => {
        // Group transactions by date
        const dateMap = new Map<string, { in: number, out: number }>();
        
        transactions.forEach(t => {
          const date = new Date(t.transactionDate || Date.now());
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, { in: 0, out: 0 });
          }
          
          const entry = dateMap.get(dateStr)!;
          if (t.transactionType === 'IN') {
            entry.in += t.quantity || 0;
          } else if (t.transactionType === 'OUT') {
            entry.out += t.quantity || 0;
          }
        });
        
        // Get last 14 days of data
        const sortedDates = Array.from(dateMap.keys()).slice(-14);
        const inData = sortedDates.map(date => dateMap.get(date)?.in || 0);
        const outData = sortedDates.map(date => dateMap.get(date)?.out || 0);
        
        this.stockMovementData = {
          labels: sortedDates,
          datasets: [
            {
              label: 'Stock In',
              data: inData,
              borderColor: '#4caf50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Stock Out',
              data: outData,
              borderColor: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        };
      },
      error: (error) => console.error('Error loading stock transactions:', error)
    });

    // Load recent orders
    this.purchaseOrderService.getAllPurchaseOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date || 0).getTime();
            const dateB = new Date(b.createdAt || b.date || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 10);
      },
      error: (error) => console.error('Error loading orders:', error)
    });
  }

  getRateClass(rate: number): string {
    if (rate >= 90) return 'rate-high';
    if (rate >= 75) return 'rate-medium';
    return 'rate-low';
  }

  exportReport(): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `SmartShelfX_Report_${timestamp}.xlsx`;

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // ========== SHEET 1: OVERVIEW ==========
    const overviewData = [
      ['SmartShelfX - Report Overview'],
      ['Generated on:', new Date().toLocaleString()],
      [],
      ['Metric', 'Value', 'Change'],
      ['Total Revenue', `$${this.totalRevenue.toFixed(2)}`, `${this.revenueChange > 0 ? '+' : ''}${this.revenueChange}%`],
      ['Total Orders', this.totalOrders.toString(), `${this.ordersChange > 0 ? '+' : ''}${this.ordersChange}%`],
      ['Stock Turnover', `${this.stockTurnover}x`, `${this.turnoverChange > 0 ? '+' : ''}${this.turnoverChange}x`],
      ['Order Fulfillment', `${this.orderFulfillment}%`, `${this.fulfillmentChange > 0 ? '+' : ''}${this.fulfillmentChange}%`]
    ];
    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');
    
    // ========== SHEET 2: STOCK BY CATEGORY ==========
    const stockByCategoryData = [
      ['Stock by Category'],
      [],
      ['Category', 'Quantity (units)']
    ];
    if (this.categoryData.length > 0) {
      this.categoryData.forEach(cat => {
        stockByCategoryData.push([cat.label, cat.value.toString()]);
      });
    } else {
      stockByCategoryData.push(['No category data available', '']);
    }
    const wsStockByCategory = XLSX.utils.aoa_to_sheet(stockByCategoryData);
    XLSX.utils.book_append_sheet(wb, wsStockByCategory, 'Stock by Category');
    
    // ========== SHEET 3: LOW STOCK ALERTS ==========
    const lowStockData = [
      ['Low Stock Alerts'],
      [],
      ['Product', 'Current Stock', 'Reorder Level']
    ];
    if (this.lowStockAlerts.length > 0) {
      this.lowStockAlerts.forEach(alert => {
        lowStockData.push([alert.productName, alert.currentStock.toString(), alert.reorderLevel.toString()]);
      });
    } else {
      lowStockData.push(['No low stock alerts', '', '']);
    }
    const wsLowStock = XLSX.utils.aoa_to_sheet(lowStockData);
    XLSX.utils.book_append_sheet(wb, wsLowStock, 'Low Stock Alerts');
    
    // ========== SHEET 4: VENDOR PERFORMANCE ==========
    const vendorPerformanceData = [
      ['Vendor Performance'],
      [],
      ['Vendor', 'Products', 'Orders', 'Fulfillment Rate', 'Avg Response Time', 'Rating']
    ];
    if (this.vendorPerformance.length > 0) {
      this.vendorPerformance.forEach(vendor => {
        vendorPerformanceData.push([
          vendor.name,
          vendor.products.toString(),
          vendor.orders.toString(),
          `${vendor.fulfillmentRate}%`,
          vendor.avgResponseTime,
          `${vendor.rating}/5`
        ]);
      });
    } else {
      vendorPerformanceData.push(['No vendor data available', '', '', '', '', '']);
    }
    const wsVendorPerformance = XLSX.utils.aoa_to_sheet(vendorPerformanceData);
    XLSX.utils.book_append_sheet(wb, wsVendorPerformance, 'Vendor Performance');
    
    // ========== SHEET 5: PURCHASE ORDER STATISTICS ==========
    const poStatsData = [
      ['Purchase Order Statistics'],
      [],
      ['Status', 'Count'],
      ['Total Orders', this.poStats.total.toString()],
      ['Pending', this.poStats.pending.toString()],
      ['Approved', this.poStats.approved.toString()],
      ['Rejected', this.poStats.rejected.toString()]
    ];
    const wsPOStats = XLSX.utils.aoa_to_sheet(poStatsData);
    XLSX.utils.book_append_sheet(wb, wsPOStats, 'PO Statistics');
    
    // ========== SHEET 6: RECENT PURCHASE ORDERS ==========
    const recentOrdersData = [
      ['Recent Purchase Orders'],
      [],
      ['Order ID', 'Product', 'Vendor', 'Quantity', 'Date', 'Status']
    ];
    if (this.recentOrders.length > 0) {
      this.recentOrders.forEach(order => {
        // Extract product name properly
        const productName = order.product?.name || order.productName || 'N/A';
        
        // Extract vendor name properly
        const vendorName = order.vendor?.fullName || order.vendor?.username || order.vendorName || 'N/A';
        
        // Extract and format date properly
        let formattedDate = 'N/A';
        const orderDate = order.createdAt || order.date;
        if (orderDate) {
          const date = new Date(orderDate);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
          }
        }
        
        recentOrdersData.push([
          `#${order.id}`,
          productName,
          vendorName,
          order.quantity.toString(),
          formattedDate,
          order.status
        ]);
      });
    } else {
      recentOrdersData.push(['No recent orders available', '', '', '', '', '']);
    }
    const wsRecentOrders = XLSX.utils.aoa_to_sheet(recentOrdersData);
    XLSX.utils.book_append_sheet(wb, wsRecentOrders, 'Recent Purchase Orders');
    
    // Generate Excel file and download
    XLSX.writeFile(wb, filename);
    
    console.log('Excel report exported successfully with', this.recentOrders.length, 'recent orders');
  }

}
