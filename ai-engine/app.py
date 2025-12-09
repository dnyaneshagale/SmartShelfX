"""
SmartShelfX AI Forecasting Engine - Lightweight Version
Flask API for demand forecasting with statistical predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import statistics
import logging
import os

# Load environment variables
# load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global configuration
FORECAST_SERVICE_CONFIG = {
    'max_forecast_days': 30,
    'confidence_threshold': 0.75,
    'min_data_points': 3
}

# ==================== Simple Forecaster ====================

class SimpleForecaster:
    """Statistical forecasting without ML dependencies"""
    
    def predict(self, historical_data, forecast_days=7):
        """
        Generate demand forecast using simple statistical methods
        """
        if not historical_data or len(historical_data) < 3:
            return []
        
        # Extract quantities
        quantities = [item.get('quantity', 0) for item in historical_data if 'quantity' in item]
        
        if not quantities:
            return []
        
        # Calculate statistics
        avg = statistics.mean(quantities)
        stdev = statistics.stdev(quantities) if len(quantities) > 1 else avg * 0.2
        
        predictions = []
        today = datetime.now()
        
        for day in range(1, min(forecast_days + 1, 31)):
            future_date = today + timedelta(days=day)
            
            predictions.append({
                'date': future_date.strftime('%Y-%m-%d'),
                'predicted_demand': int(round(avg)),
                'lower_bound': int(round(max(0, avg - 1.96 * stdev))),
                'upper_bound': int(round(avg + 1.96 * stdev)),
                'confidence_score': 0.75
            })
        
        return predictions

forecaster = SimpleForecaster()

# ==================== API Endpoints ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_trained': forecaster.is_trained
    }), 200

@app.route('/api/forecast/predict', methods=['POST'])
def predict_demand():
    """
    Generate demand forecast for a product
    
    Request body:
    {
        "product_id": 1,
        "historical_data": [
            {"date": "2024-01-01", "quantity": 100},
            ...
        ],
        "forecast_days": 7
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        product_id = data.get('product_id')
        historical_data = data.get('historical_data', [])
        forecast_days = data.get('forecast_days', 7)
        
        if not historical_data:
            return jsonify({'error': 'No historical data provided'}), 400
        
        # Train model if needed
        if not forecaster.is_trained or len(historical_data) >= 20:
            forecaster.train(historical_data)
        
        # Generate predictions
        predictions = forecaster.predict(historical_data, forecast_days)
        
        return jsonify({
            'product_id': product_id,
            'forecast_generated_at': datetime.now().isoformat(),
            'predictions': predictions,
            'summary': {
                'avg_predicted_demand': int(np.mean([p['predicted_demand'] for p in predictions])),
                'max_predicted_demand': int(max([p['predicted_demand'] for p in predictions])),
                'confidence': np.mean([p['confidence_score'] for p in predictions])
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast/batch-predict', methods=['POST'])
def batch_predict():
    """
    Batch forecast for multiple products
    
    Request body:
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
    """
    try:
        data = request.get_json()
        products = data.get('products', [])
        
        if not products:
            return jsonify({'error': 'No products provided'}), 400
        
        results = []
        
        for product in products:
            product_id = product.get('product_id')
            historical_data = product.get('historical_data', [])
            forecast_days = product.get('forecast_days', 7)
            
            if not historical_data:
                logger.warning(f"Skipping product {product_id}: no historical data")
                continue
            
            # Train if needed
            if not forecaster.is_trained:
                forecaster.train(historical_data)
            
            # Predict
            predictions = forecaster.predict(historical_data, forecast_days)
            
            results.append({
                'product_id': product_id,
                'predictions': predictions,
                'status': 'success'
            })
        
        return jsonify({
            'batch_id': int(datetime.now().timestamp()),
            'total_products': len(products),
            'processed': len(results),
            'results': results,
            'generated_at': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast/risk-analysis', methods=['POST'])
def analyze_stockout_risk():
    """
    Analyze products at risk of stockout
    
    Request body:
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
    """
    try:
        data = request.get_json()
        products = data.get('products', [])
        
        risk_analysis = []
        
        for product in products:
            product_id = product.get('product_id')
            current_stock = product.get('current_stock', 0)
            reorder_level = product.get('reorder_level', 0)
            historical_data = product.get('historical_data', [])
            
            if not historical_data:
                continue
            
            # Get predictions
            predictions = forecaster.predict(historical_data, 7)
            
            # Calculate risk
            total_predicted_demand = sum([p['predicted_demand'] for p in predictions])
            days_until_stockout = None
            
            cumulative_stock = current_stock
            for pred in predictions:
                cumulative_stock -= pred['predicted_demand']
                if cumulative_stock <= 0:
                    days_until_stockout = predictions.index(pred) + 1
                    break
            
            # Determine risk level
            if days_until_stockout is None:
                risk_level = 'LOW'
            elif days_until_stockout <= 3:
                risk_level = 'CRITICAL'
            elif days_until_stockout <= 7:
                risk_level = 'HIGH'
            else:
                risk_level = 'MEDIUM'
            
            # Recommended reorder quantity
            recommended_reorder = max(0, reorder_level - current_stock + total_predicted_demand)
            
            risk_analysis.append({
                'product_id': product_id,
                'current_stock': current_stock,
                'reorder_level': reorder_level,
                'total_predicted_demand_7days': total_predicted_demand,
                'days_until_stockout': days_until_stockout,
                'risk_level': risk_level,
                'recommended_reorder_qty': recommended_reorder
            })
        
        return jsonify({
            'analysis_timestamp': datetime.now().isoformat(),
            'total_products_analyzed': len(products),
            'at_risk_products': len([p for p in risk_analysis if p['risk_level'] in ['HIGH', 'CRITICAL']]),
            'risk_analysis': risk_analysis
        }), 200
    
    except Exception as e:
        logger.error(f"Risk analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast/train', methods=['POST'])
def train_model():
    """
    Manually train the model with historical data
    
    Request body:
    {
        "historical_data": [
            {"date": "2024-01-01", "quantity": 100},
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        historical_data = data.get('historical_data', [])
        
        if not historical_data:
            return jsonify({'error': 'No training data provided'}), 400
        
        success = forecaster.train(historical_data)
        
        return jsonify({
            'status': 'success' if success else 'failed',
            'model_trained': forecaster.is_trained,
            'data_points_used': len(historical_data),
            'timestamp': datetime.now().isoformat()
        }), 200 if success else 500
    
    except Exception as e:
        logger.error(f"Training error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast/config', methods=['GET'])
def get_config():
    """Get current forecasting configuration"""
    return jsonify({
        'max_forecast_days': FORECAST_SERVICE_CONFIG['max_forecast_days'],
        'confidence_threshold': FORECAST_SERVICE_CONFIG['confidence_threshold'],
        'min_data_points': FORECAST_SERVICE_CONFIG['min_data_points'],
        'model_status': {
            'trained': forecaster.is_trained,
            'type': 'RandomForest'
        }
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    logger.error(f"Server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
