export const environment = {
  production: true,
  apiUrl: (window as any)['env']?.['apiUrl'] || 'https://smartshelfx-backend-542876661339.us-central1.run.app/api'
};
