"""
Test script for SmartShelfX AI Service
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test health check endpoint"""
    print("Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print("✅ Health check passed\n")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}\n")
        return False

def test_forecast(sku):
    """Test forecast endpoint for a specific SKU"""
    print(f"Testing Forecast for {sku}...")
    try:
        response = requests.get(f"{BASE_URL}/forecast/{sku}")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        print(f"✅ Forecast for {sku}: {data['predictedQuantity']} units\n")
        return True
    except Exception as e:
        print(f"❌ Forecast failed for {sku}: {e}\n")
        return False

def run_all_tests():
    """Run all tests"""
    print("=" * 50)
    print("SmartShelfX AI Service - Test Suite")
    print("=" * 50 + "\n")
    
    # Test health check
    if not test_health_check():
        print("⚠️  Service may not be running. Start with: python main.py")
        return
    
    # Test known SKUs
    test_skus = ["PROD-001", "PROD-002", "PROD-004", "PROD-005", "PROD-010"]
    
    print("Testing Known SKUs:")
    print("-" * 50)
    for sku in test_skus:
        test_forecast(sku)
    
    # Test unknown SKU
    print("Testing Unknown SKU:")
    print("-" * 50)
    test_forecast("UNKNOWN-ABC")
    
    print("=" * 50)
    print("Test Suite Complete!")
    print("=" * 50)

if __name__ == "__main__":
    run_all_tests()
