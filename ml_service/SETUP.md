# ML Service Setup Guide

## Overview
This is a Python Flask microservice that handles OCR (Optical Character Recognition) document processing and question extraction. It works as a separate service that integrates with the main Node.js backend.

## Prerequisites

### System Requirements
- Python 3.8 or higher
- Tesseract OCR engine
- pip (Python package manager)

### Installation of Tesseract (Required)

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**macOS (with Homebrew):**
```bash
brew install tesseract
```

**Windows:**
Download installer from: https://github.com/UB-Mannheim/tesseract/wiki

## Installation Steps

### 1. Navigate to ML Service Directory
```bash
cd ml_service
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Edit `.env` file:
```env
FLASK_DEBUG=True
ML_SERVICE_PORT=5001
UPLOAD_FOLDER=/tmp/ocr_uploads
```

### 5. Start the Service
```bash
python app.py
```

The service will run on `http://localhost:5001`

## API Endpoints

### POST /api/parse-document
Processes a document file and extracts questions.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (PDF, JPG, or PNG)

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "text": "What is the time complexity?",
      "options": ["O(n)", "O(log n)", "O(n^2)"],
      "answer": null,
      "section": "General"
    }
  ],
  "total_extracted": 10,
  "total_valid": 8,
  "raw_text": "Sample text..."
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "OCR Parser Service"
}
```

## Integration with Node.js Backend

Add to Node.js `.env`:
```env
ML_SERVICE_URL=http://localhost:5001
```

The file controller will automatically call the ML service when OCR processing is triggered.

## Supported File Types
- PDF (.pdf)
- JPEG (.jpg, .jpeg)
- PNG (.png)

## Max File Size
50MB

## Error Handling
- Corrupted files return detailed error messages
- Empty documents return 0 questions
- Unsupported file types are rejected
- Connection errors are handled gracefully

## Testing

### Using cURL
```bash
curl -X POST -F "file=@document.pdf" http://localhost:5001/api/parse-document
```

### Using Python Requests
```python
import requests

with open('document.pdf', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5001/api/parse-document', files=files)
    print(response.json())
```
