import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="app-container">
      @if (showNavbar) {
        <app-navbar />
      }
      <main [class.full-height]="!showNavbar">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    main {
      flex: 1;
      overflow-y: auto;
      background: #f5f5f5;
    }

    main.full-height {
      height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'SmartShelfX';
  showNavbar = false;

  constructor(private router: Router) {
    // Hide navbar on login and signup pages
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.url;
        this.showNavbar = !url.includes('/login') && !url.includes('/signup');
      });
  }
}
