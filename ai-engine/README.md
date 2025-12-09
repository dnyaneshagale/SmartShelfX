# SmartShelfX AI Forecasting Engine

Flask-based AI microservice for demand forecasting and inventory predictions.

## Features

- **Demand Forecasting**: ML-based predictions for inventory demand
- **Stockout Risk Analysis**: Identify products at risk of running out of stock
- **Batch Predictions**: Process multiple products simultaneously
- **Confidence Intervals**: Provide uncertainty estimates with predictions
- **Scalable**: Designed for production deployment

## Prerequisites

- Python 3.9+
- pip or conda

## Installation

1. **Create Virtual Environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure Environment**:
```bash
cp .env.example .env
# Edit .env with your settings
```

## Usage

### Development

```bash
python app.py
```

Server will start at `http://localhost:8000`

### Production

```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## API Endpoints

### Health Check
```
GET /health
```

### Generate Forecast
```
POST /api/forecast/predict

{
  "product_id": 1,
  "historical_data": [
    {"date": "2024-01-01", "quantity": 100},
    {"date": "2024-01-02", "quantity": 120},
    ...
  ],
  "forecast_days": 7
}
```

### Batch Forecasts
```
POST /api/forecast/batch-predict

{
  "products": [
    {
      "product_id": 1,
      "historical_data": [...],
      "forecast_days": 7
    },
    ...
  ]
}
```

### Risk Analysis
```
POST /api/forecast/risk-analysis

{
  "products": [
    {
      "product_id": 1,
      "current_stock": 50,
      "reorder_level": 20,
      "historical_data": [...]
    }
  ]
}
```

### Train Model
```
POST /api/forecast/train

{
  "historical_data": [
    {"date": "2024-01-01", "quantity": 100},
    ...
  ]
}
```

### Get Configuration
```
GET /api/forecast/config
```

## Integration with Java Backend

The Java backend communicates with this service at the configured URL. Update `application.properties`:

```properties
ai.forecast.service.url=http://localhost:8000
ai.forecast.service.enabled=true
```

## Response Format

### Forecast Response
```json
{
  "product_id": 1,
  "forecast_generated_at": "2024-01-15T10:30:00",
  "predictions": [
    {
      "date": "2024-01-16",
      "predicted_demand": 150,
      "lower_bound": 120,
      "upper_bound": 180,
      "confidence_score": 0.85
    }
  ],
  "summary": {
    "avg_predicted_demand": 150,
    "max_predicted_demand": 180,
    "confidence": 0.85
  }
}
```

## Model Features

The RandomForest model uses the following features:
- Day of week
- Day of month
- Month
- 7-day rolling average
- 14-day rolling average
- Lag-1 (previous day quantity)
- Lag-7 (7 days ago quantity)

## Performance Optimization

- Batch processing for multiple products
- Efficient pandas operations
- Multi-threading support via scikit-learn
- Caching opportunities (future enhancement)

## Future Enhancements

- [ ] LSTM/GRU models for better sequence prediction
- [ ] Seasonal decomposition (SARIMA)
- [ ] Anomaly detection
- [ ] Model versioning and A/B testing
- [ ] Real-time model retraining
- [ ] API documentation with Swagger
- [ ] Database caching layer

## Troubleshooting

### Insufficient data points
Ensure at least 10 historical data points are provided for accurate predictions.

### Low confidence score
May indicate high volatility in demand. Consider using longer historical data.

### Model not trained
Call the `/api/forecast/train` endpoint first or provide enough historical data.

## Performance Tips

1. Provide at least 30 days of historical data for better accuracy
2. Include consistent timestamps
3. Handle outliers in historical data
4. Use batch API for multiple products
5. Cache predictions if demand patterns are stable

## Docker Deployment

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
```

Build and run:
```bash
docker build -t smartshelfx-ai .
docker run -p 8000:8000 smartshelfx-ai
```

## License

Part of SmartShelfX project

## Support

For issues and questions, refer to the main project documentation.
