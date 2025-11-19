import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DEBUG = os.getenv('FLASK_DEBUG', False)
    PORT = int(os.getenv('ML_SERVICE_PORT', 5001))
    MAX_FILE_SIZE = 50 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', '/tmp/ocr_uploads')
