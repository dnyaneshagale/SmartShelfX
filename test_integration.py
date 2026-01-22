"""
SmartShelfX - Integration Test
Tests the communication between Backend and AI Service
"""

import requests
import json
import time

# Configuration
AI_SERVICE_URL = "http://localhost:8000"
BACKEND_URL = "http://localhost:8080"

def print_section(title):
    """Print formatted section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_ai_service():
    """Test AI Service availability and endpoints"""
    print_section("TESTING AI SERVICE")
    
    try:
        # Test health check
        print("\n1. Testing AI Service Health Check...")
        response = requests.get(f"{AI_SERVICE_URL}/health", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("   ✅ AI Service is running")
        else:
            print("   ❌ AI Service health check failed")
            return False
        
        # Test forecast endpoint
        print("\n2. Testing AI Service Forecast...")
        test_skus = ["PROD-001", "PROD-005"]
        
        for sku in test_skus:
            response = requests.get(f"{AI_SERVICE_URL}/forecast/{sku}", timeout=5)
            print(f"\n   SKU: {sku}")
            print(f"   Status: {response.status_code}")
            data = response.json()
            print(f"   Prediction: {data['predictedQuantity']} units")
            
            if response.status_code == 200:
                print(f"   ✅ Forecast successful")
            else:
                print(f"   ❌ Forecast failed")
                return False
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("\n   ❌ Cannot connect to AI Service")
        print("   Make sure it's running on port 8000")
        print("   Start with: cd ai-service && python main.py")
        return False
    except Exception as e:
        print(f"\n   ❌ Error testing AI Service: {e}")
        return False

def test_backend():
    """Test Backend availability and authentication"""
    print_section("TESTING BACKEND")
    
    try:
        # Test authentication
        print("\n1. Testing Backend Authentication...")
        login_data = {
            "username": "admin",
            "password": "password123"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json=login_data,
            timeout=5
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Username: {data['username']}")
            print(f"   Role: {data['role']}")
            print("   ✅ Authentication successful")
            token = data['token']
        else:
            print("   ❌ Authentication failed")
            return False, None
        
        # Test products endpoint
        print("\n2. Testing Backend Products API...")
        response = requests.get(f"{BACKEND_URL}/api/products", timeout=5)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            products = response.json()
            print(f"   Total Products: {len(products)}")
            print("   ✅ Products API working")
        else:
            print("   ❌ Products API failed")
            return False, None
        
        # Test dashboard
        print("\n3. Testing Backend Dashboard...")
        response = requests.get(f"{BACKEND_URL}/api/dashboard/stats", timeout=5)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            stats = response.json()
            print(f"   Total Products: {stats['totalProducts']}")
            print(f"   Low Stock Count: {stats['lowStockCount']}")
            print(f"   Pending POs: {stats['pendingPurchaseOrders']}")
            print("   ✅ Dashboard API working")
        else:
            print("   ❌ Dashboard API failed")
            return False, None
        
        return True, token
        
    except requests.exceptions.ConnectionError:
        print("\n   ❌ Cannot connect to Backend")
        print("   Make sure it's running on port 8080")
        print("   Start with: cd backend && mvn spring-boot:run")
        return False, None
    except Exception as e:
        print(f"\n   ❌ Error testing Backend: {e}")
        return False, None

def test_integration():
    """Test integration between Backend and AI Service"""
    print_section("TESTING INTEGRATION")
    
    try:
        print("\n1. Testing Backend → AI Service Communication...")
        
        # Call backend forecast endpoint (which internally calls AI service)
        test_sku = "PROD-001"
        print(f"\n   Requesting forecast for {test_sku} from Backend...")
        
        response = requests.get(
            f"{BACKEND_URL}/api/forecast/{test_sku}",
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   SKU: {data['sku']}")
            print(f"   Predicted Quantity: {data['predictedQuantity']}")
            print(f"   Current Stock: {data['currentStock']}")
            print(f"   Needs Reorder: {data['needsReorder']}")
            print("\n   ✅ Integration successful!")
            print("   Backend successfully communicated with AI Service")
            return True
        else:
            print("   ❌ Integration failed")
            print(f"   Error: {response.text}")
            return False
        
    except Exception as e:
        print(f"\n   ❌ Integration test failed: {e}")
        return False

def run_full_test():
    """Run complete integration test suite"""
    print("\n" + "█"*60)
    print("█" + " "*58 + "█")
    print("█" + "  SmartShelfX - Full Integration Test".center(58) + "█")
    print("█" + " "*58 + "█")
    print("█"*60)
    
    results = {
        "ai_service": False,
        "backend": False,
        "integration": False
    }
    
    # Test AI Service
    results["ai_service"] = test_ai_service()
    
    if not results["ai_service"]:
        print("\n⚠️  AI Service not available. Skipping remaining tests.")
        print_summary(results)
        return
    
    # Small delay
    time.sleep(1)
    
    # Test Backend
    backend_ok, token = test_backend()
    results["backend"] = backend_ok
    
    if not results["backend"]:
        print("\n⚠️  Backend not available. Skipping integration test.")
        print_summary(results)
        return
    
    # Small delay
    time.sleep(1)
    
    # Test Integration
    results["integration"] = test_integration()
    
    # Print summary
    print_summary(results)

def print_summary(results):
    """Print test results summary"""
    print_section("TEST RESULTS SUMMARY")
    
    print("\n   Component Tests:")
    print(f"   - AI Service:     {'✅ PASS' if results['ai_service'] else '❌ FAIL'}")
    print(f"   - Backend:        {'✅ PASS' if results['backend'] else '❌ FAIL'}")
    print(f"   - Integration:    {'✅ PASS' if results['integration'] else '❌ FAIL'}")
    
    all_passed = all(results.values())
    
    print("\n" + "="*60)
    if all_passed:
        print("   🎉 ALL TESTS PASSED!")
        print("   SmartShelfX system is fully operational")
    else:
        print("   ⚠️  SOME TESTS FAILED")
        print("   Please check the services and try again")
    print("="*60 + "\n")

if __name__ == "__main__":
    run_full_test()
