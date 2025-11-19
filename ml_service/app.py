from flask import Flask
from flask_cors import CORS
import os
import logging
from ml_service.config import Config
from ml_service.routes import parser_bp

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={
        r"/*": {
            "origins": ["*"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    app.register_blueprint(parser_bp, url_prefix='/api')

    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'healthy', 'service': 'ML OCR Service'}, 200

    @app.errorhandler(404)
    def not_found(error):
        return {'success': False, 'error': 'Endpoint not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {'success': False, 'error': 'Internal server error'}, 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)
