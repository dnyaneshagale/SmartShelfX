"""
SmartShelfX AI Service - Demand Forecasting
FastAPI service for simple demand prediction
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os

from forecast_logic import predict_demand

app = FastAPI(
    title="SmartShelfX AI Service",
    description="Simple demand forecasting for inventory management",
    version="1.0.0"
    
)

# CORS configuration - allow all origins for production
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

class ForecastResponse(BaseModel):
    sku: str
    predictedQuantity: int
    method: str = "moving_average"
    confidence: str = "demo"

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "service": "SmartShelfX AI Forecasting",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/forecast/{sku}", response_model=ForecastResponse)
def get_forecast(sku: str):
    """
    Get demand forecast for a product by SKU
    
    Args:
        sku: Product SKU code (e.g., PROD-001)
    
    Returns:
        ForecastResponse with predicted quantity
    """
    try:
        # Call forecasting logic
        predicted_quantity = predict_demand(sku)
        
        return ForecastResponse(
            sku=sku,
            predictedQuantity=predicted_quantity,
            method="moving_average",
            confidence="demo"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Forecast calculation failed: {str(e)}"
        )

@app.get("/health")
def health_check():
    """Service health check"""
    return {"status": "healthy", "service": "ai-forecast"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    
    print("\n" + "="*50)
    print("SmartShelfX AI Service Starting...")
    print("="*50)
    print(f"API Docs: http://localhost:{port}/docs")
    print(f"Health Check: http://localhost:{port}/health")
    print("="*50 + "\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
