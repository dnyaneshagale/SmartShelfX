"""
Simple Demand Forecasting Logic
Uses moving average and basic statistical methods for demo purposes
"""

import random
from typing import Dict, List
import hashlib

# Simulated historical sales data for demo
# In production, this would come from the database via API call
SAMPLE_SALES_DATA = {
    "PROD-001": [2, 1, 3, 2, 1, 2, 1],  # 7 Days of sales
    "PROD-002": [5, 4, 3, 2, 6, 4, 2],
    "PROD-003": [1, 2, 1, 3, 4, 2, 1],
    "PROD-004": [8, 6, 5, 7, 9, 5, 7],
    "PROD-005": [10, 8, 12, 10, 8, 12, 15],
    "PROD-006": [2, 3, 2, 1, 2, 3, 2],
    "PROD-007": [3, 4, 2, 3, 4, 5, 3],
    "PROD-008": [2, 1, 2, 1, 1, 2, 1],
    "PROD-009": [1, 2, 1, 1, 2, 1, 2],
    "PROD-010": [3, 4, 3, 2, 3, 4, 3]
}

def moving_average(data: List[int], window: int = 7) -> float:
    """
    Calculate simple moving average
    
    Args:
        data: List of historical values
        window: Number of periods to average
    
    Returns:
        Moving average value
    """
    if len(data) == 0: #len(data) < window:
        return 0.0
    
    window = min(window, len(data))
    return sum(data[-window:]) / window

def weighted_moving_average(data: List[int]) -> float:
    """
    Calculate weighted moving average (recent data has more weight)
    
    Args:
        data: List of historical values
    
    Returns:
        Weighted average value
    """
    if len(data) == 0:
        return 0.0
    
    weights = list(range(1, len(data) + 1))
    weighted_sum = sum(d * w for d, w in zip(data, weights)) # sum of data * weight
    total_weight = sum(weights)
    
    return weighted_sum / total_weight if total_weight > 0 else 0.0

def linear_trend(data: List[int]) -> float:
    """
    Simple linear trend projection
    
    Args:
        data: List of historical values
    
    Returns:
        Next period prediction based on linear trend
    """
    if len(data) < 2:
        return data[0] if data else 0.0
    
    n = len(data)
    x = list(range(n))
    
    # Simple linear regression: y = mx + b
    x_mean = sum(x) / n
    y_mean = sum(data) / n
    
    numerator = sum((x[i] - x_mean) * (data[i] - y_mean) for i in range(n)) # covariance
    denominator = sum((x[i] - x_mean) ** 2 for i in range(n)) # variance
    
    if denominator == 0:
        return y_mean
    
    slope = numerator / denominator
    intercept = y_mean - slope * x_mean
    
    # Predict next period (n)
    next_value = slope * n + intercept
    
    return max(0, next_value)  # Ensure non-negative

def predict_demand(sku: str) -> int:
    """
    Main forecasting function - combines multiple methods
    
    Args:
        sku: Product SKU code
    
    Returns:
        Predicted demand quantity (integer)
    """
    
    # Get historical data (or generate pseudo-random for demo)
    if sku in SAMPLE_SALES_DATA:
        sales_data = SAMPLE_SALES_DATA[sku]
    else:
        # Generate deterministic "random" data based on SKU
        # This ensures consistent results for same SKU
        seed = int(hashlib.md5(sku.encode()).hexdigest(), 16) % 100
        random.seed(seed)
        sales_data = [random.randint(1, 10) for _ in range(7)]
    
    # Calculate using different methods
    ma_prediction = moving_average(sales_data)
    wma_prediction = weighted_moving_average(sales_data)
    trend_prediction = linear_trend(sales_data)
    
    # Ensemble: Average of all methods
    ensemble_prediction = (ma_prediction + wma_prediction + trend_prediction) / 3
    
    # Add safety stock factor (10-20% buffer)
    safety_factor = 1.15
    final_prediction = ensemble_prediction * safety_factor
    
    # Round to integer and ensure minimum of 5 units
    predicted_quantity = max(5, int(round(final_prediction)))
    
    return predicted_quantity

def get_forecast_confidence(data: List[int]) -> str: 

    """
    Calculate confidence level based on data variance
    
    Args:
        data: Historical sales data
    
    Returns:
        Confidence level: 'high', 'medium', or 'low'
    """
    if len(data) < 3:
        return "low"
    
    mean = sum(data) / len(data)
    variance = sum((x - mean) ** 2 for x in data) / len(data)
    std_dev = variance ** 0.5
    
    # Coefficient of variation
    cv = (std_dev / mean) if mean > 0 else 1.0
    
    if cv < 0.2:
        return "high"
    elif cv < 0.5:
        return "medium"
    else:
        return "low"

# Simple test function
if __name__ == "__main__":
    print("Testing Forecast Logic...")
    print("-" * 40)
    
    test_skus = ["PROD-001", "PROD-004", "PROD-005", "UNKNOWN-SKU"]
    
    for sku in test_skus:
        prediction = predict_demand(sku)
        print(f"{sku}: Predicted Demand = {prediction} units")
    
    print("-" * 40)
    print("Test Complete!")
