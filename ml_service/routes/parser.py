from flask import Blueprint, request, jsonify
import os
import logging
from werkzeug.utils import secure_filename
from ml_service.config import Config
from ml_service.utils import OCRProcessor

parser_bp = Blueprint('parser', __name__)
logger = logging.getLogger(__name__)

try:
    ocr_processor = OCRProcessor()
except Exception as e:
    logger.error(f"Failed to initialize OCR processor: {str(e)}")
    ocr_processor = None

ALLOWED_EXTENSIONS = Config.ALLOWED_EXTENSIONS

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@parser_bp.route('/parse-document', methods=['POST', 'OPTIONS'])
def parse_document():
    if request.method == 'OPTIONS':
        return '', 204

    try:
        if not ocr_processor:
            return jsonify({
                'success': False,
                'error': 'OCR service not initialized. Check Tesseract installation.',
                'questions': []
            }), 503

        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400

        file_size = len(file.read())
        file.seek(0)

        if file_size > Config.MAX_FILE_SIZE:
            return jsonify({
                'success': False,
                'error': f'File size exceeds maximum allowed size of {Config.MAX_FILE_SIZE / (1024 * 1024):.0f}MB'
            }), 400

        file_bytes = file.read()
        file_ext = file.filename.rsplit('.', 1)[1].lower()

        logger.info(f"Processing file: {file.filename} ({file_size} bytes)")
        result = ocr_processor.process_document(file_bytes, file_ext)
        logger.info(f"OCR result: {len(result.get('questions', []))} valid questions extracted")

        return jsonify(result), 200 if result['success'] else 400

    except Exception as e:
        logger.exception(f"Error processing document: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}',
            'questions': []
        }), 500


@parser_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'OCR Parser Service'
    }), 200
