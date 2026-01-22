# SmartShelfX AI Service

## Overview
Python FastAPI service providing simple demand forecasting for SmartShelfX inventory management system.

## Technology Stack
- **Python**: 3.9+
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Forecasting**: Simple statistical methods (Moving Average, Linear Trend)

## Features
- ✅ Moving Average prediction
- ✅ Weighted Moving Average
- ✅ Linear Trend projection
- ✅ Ensemble method (combines all three)
- ✅ Safety stock buffer (15%)
- ✅ RESTful API with auto-documentation

## Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

## Installation

### 1. Create Virtual Environment (Recommended)
```bash
# Navigate to ai-service directory
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

## Running the Service

### Start the Server
```bash
# Make sure you're in ai-service directory with venv activated
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The service will start on `http://localhost:8000`

## API Endpoints

### 1. Health Check
```bash
GET http://localhost:8000/
GET http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "ai-forecast"
}
```

### 2. Get Forecast
```bash
GET http://localhost:8000/forecast/{sku}
```

**Example:**
```bash
curl http://localhost:8000/forecast/PROD-001
```

**Response:**
```json
{
  "sku": "PROD-001",
  "predictedQuantity": 15,
  "method": "moving_average",
  "confidence": "demo"
}
```

### 3. API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Forecasting Logic

### Methods Used:
1. **Moving Average** - Simple average of last 7 days
2. **Weighted Moving Average** - Recent data weighted higher
3. **Linear Trend** - Projects trend into future
4. **Ensemble** - Averages all three methods
5. **Safety Stock** - Adds 15% buffer

### Sample Data
Pre-configured with 10 sample SKUs (PROD-001 to PROD-010) with simulated sales history.
Unknown SKUs generate deterministic pseudo-random forecasts.

## Testing

### Test Forecasting Logic
```bash
python forecast_logic.py
```

### Test API Endpoints
```bash
# Using curl
curl http://localhost:8000/forecast/PROD-001
curl http://localhost:8000/forecast/PROD-005

# Using Python
python -c "import requests; print(requests.get('http://localhost:8000/forecast/PROD-001').json())"
```

## Integration with Backend

The Spring Boot backend calls this service:
```java
// In ForecastService.java
String url = "http://localhost:8000/forecast/" + sku;
Map<String, Object> response = restTemplate.getForObject(url, Map.class);
```

**Backend Configuration:**
```properties
# application.properties
ai.service.url=http://localhost:8000
```

## Project Structure
```
ai-service/
├── main.py              # FastAPI application
├── forecast_logic.py    # Forecasting algorithms
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Environment Variables (Optional)
```bash
# Set custom port
export PORT=8000

# Set log level
export LOG_LEVEL=info
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in main.py or use:
uvicorn main:app --port 8001
```

### Module Not Found
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

### CORS Issues
- CORS is enabled for all origins in main.py
- Check `allow_origins=["*"]` setting

## Production Notes

⚠️ **This is a DEMO implementation**:
- Uses simple statistical methods, not ML models
- Sample data is hardcoded
- No persistent storage
- No authentication
- No rate limiting

For production:
- Replace with ML models (ARIMA, LSTM, Prophet)
- Connect to actual database for historical data
- Add authentication & rate limiting
- Implement model versioning
- Add monitoring & logging
- Use proper ML pipeline

## Performance
- Response time: < 50ms
- Supports concurrent requests
- Stateless (no session storage)
- Memory efficient

## API Contract

### Request
- Method: GET
- Path: /forecast/{sku}
- Path Parameter: sku (string)

### Response
- Status: 200 OK
- Content-Type: application/json
- Body:
  ```json
  {
    "sku": "string",
    "predictedQuantity": "integer",
    "method": "string",
    "confidence": "string"
  }
  ```

### Error Response
- Status: 500 Internal Server Error
- Body:
  ```json
  {
    "detail": "Error message"
  }
  ```

## Development

### Add New Forecasting Method
1. Add function to `forecast_logic.py`
2. Update `predict_demand()` to include new method
3. Test with sample data

### Modify Sample Data
Edit `SAMPLE_SALES_DATA` dictionary in `forecast_logic.py`

## Contact
For questions about this AI service, refer to the main SmartShelfX documentation.

---

**Status: ✅ Ready for Demo**
