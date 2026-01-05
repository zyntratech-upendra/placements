from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import logging
from config import get_ocr_config
from services.ocr_processor import OCRProcessor

router = APIRouter()
logger = logging.getLogger(__name__)

try:
    ocr_processor = OCRProcessor()
    logger.info("OCR Processor initialized successfully with GPT-4o-mini Vision")
except Exception as e:
    logger.error(f"Failed to initialize OCR processor: {str(e)}")
    ocr_processor = None

# Get OCR configuration
ocr_config = get_ocr_config()
ALLOWED_EXTENSIONS = ocr_config["ALLOWED_EXTENSIONS"]
MAX_FILE_SIZE = ocr_config["MAX_FILE_SIZE"]

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/parse-document")
async def parse_document(file: UploadFile = File(...)):
    """
    Parse document and extract MCQ questions using GPT-4o-mini Vision API.
    Accepts PDF, JPG, JPEG, PNG files.
    
    For PDFs with multiple pages, the document is automatically split into chunks
    and processed page by page to ensure accurate extraction.
    """
    try:
        if not ocr_processor:
            return JSONResponse(
                status_code=503,
                content={
                    'success': False,
                    'error': 'OCR service not initialized. Check OPENAI_API_KEY in environment variables.',
                    'questions': []
                }
            )

        # Handle missing filename - try to infer from content-type or use default
        filename = file.filename or 'uploaded_file'
        if not file.filename:
            logger.warning("No filename provided, attempting to infer from content-type")
            content_type = file.content_type or ''
            if 'pdf' in content_type:
                filename = 'uploaded_file.pdf'
            elif 'jpeg' in content_type or 'jpg' in content_type:
                filename = 'uploaded_file.jpg'
            elif 'png' in content_type:
                filename = 'uploaded_file.png'

        # Read file content
        file_bytes = await file.read()
        file_size = len(file_bytes)

        if file_size == 0:
            raise HTTPException(
                status_code=400,
                detail='Empty file provided'
            )

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f'File size exceeds maximum allowed size of {MAX_FILE_SIZE / (1024 * 1024):.0f}MB'
            )

        # Extract file extension
        if '.' in filename:
            file_ext = filename.rsplit('.', 1)[1].lower()
        else:
            # Try to infer from content type if no extension
            content_type = file.content_type or ''
            if 'pdf' in content_type:
                file_ext = 'pdf'
            elif 'jpeg' in content_type or 'jpg' in content_type:
                file_ext = 'jpg'
            elif 'png' in content_type:
                file_ext = 'png'
            else:
                raise HTTPException(
                    status_code=400,
                    detail='Could not determine file type. Please ensure file has an extension or correct content-type.'
                )

        # Validate file extension is allowed
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}. Received: {file_ext}'
            )

        logger.info(f"Processing file: {filename} ({file_size} bytes, type: {file_ext})")
        
        # Process document with GPT-4o-mini Vision
        try:
            result = ocr_processor.process_document(file_bytes, file_ext)
            logger.info(f"OCR result: {len(result.get('questions', []))} valid questions extracted")
            
            status_code = 200 if result['success'] else 400
            return JSONResponse(status_code=status_code, content=result)
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            raise

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error processing document: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                'success': False,
                'error': f'Server error: {str(e)}',
                'questions': []
            }
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for OCR service"""
    status = 'healthy' if ocr_processor else 'unhealthy'
    return {
        'status': status,
        'service': 'GPT-4o-mini Vision OCR Parser Service',
        'initialized': ocr_processor is not None,
        'endpoint': '/api/parse-document'
    }
