# OCR Processing Troubleshooting Guide

## Error: 404 when clicking "Process OCR"

If you're getting a 404 error when clicking the "Process OCR" button, follow these steps:

### Step 1: Verify Python Backend is Running

The OCR functionality requires the Python FastAPI backend (`interview-backend`) to be running.

**Check if it's running:**
```bash
# Navigate to interview-backend directory
cd interview-backend

# Start the backend
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Verify it's accessible:**
- Open browser: `http://localhost:8000/api/health`
- Should return: `{"status": "healthy", "service": "GPT-4o-mini Vision OCR Parser Service", "initialized": true}`

### Step 2: Check Environment Variables

**Python Backend (.env file in `interview-backend/`):**
```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=ai_interviewer
```

**Node.js Backend (.env file in `backend-code/`):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=your_secret_key
ML_SERVICE_URL=http://localhost:8000  # Add this if Python backend is on different URL
```

### Step 3: Verify Python Dependencies

```bash
cd interview-backend
pip install -r requirements.txt
```

Make sure these are installed:
- `PyMuPDF==1.23.8` (for PDF to image conversion - no external dependencies needed)
- `Pillow==10.2.0`
- `openai==1.12.0`

### Step 5: Check Logs

**Node.js Backend logs** (should show):
```
[OCR] Sending request to: http://localhost:8000/api/parse-document
[OCR] File: example.pdf, Path: uploads/file-123.pdf
```

**Python Backend logs** (should show):
```
INFO: Processing file: example.pdf (123456 bytes, type: pdf)
INFO: Converted PDF to 5 page(s)
INFO: Split into 3 chunk(s) for processing
INFO: Chunk 1: Extracted 3 questions
```

### Step 6: Common Issues

#### Issue: "Cannot connect to OCR service"
**Solution:** Ensure Python backend is running on port 8000

#### Issue: "OCR service not initialized"
**Solution:** Check `OPENAI_API_KEY` is set correctly in Python backend `.env`

#### Issue: "File not found on disk"
**Solution:** Check file upload path in Node.js backend `uploads/` directory

#### Issue: "Timeout error"
**Solution:** Large PDFs take longer. Increase timeout or split PDF into smaller files

### Step 7: Test OCR Endpoint Directly

**Using curl:**
```bash
curl -X POST http://localhost:8000/api/parse-document \
  -F "file=@/path/to/your/test.pdf"
```

**Using Postman:**
1. POST to `http://localhost:8000/api/parse-document`
2. Body → form-data
3. Key: `file`, Type: File
4. Select a PDF file
5. Send

### Step 8: Production Deployment

If deploying to production:

1. **Set ML_SERVICE_URL** in Node.js backend environment:
   ```env
   ML_SERVICE_URL=https://your-python-backend-url.com
   ```

2. **Ensure both backends are accessible** from each other

3. **Check CORS settings** in Python backend (`main.py`)

4. **Verify network connectivity** between services

### Quick Diagnostic Commands

```bash
# Check if Python backend is running
curl http://localhost:8000/api/health

# Check if Node.js backend can reach Python backend
curl http://localhost:5000/api/files  # Should require auth

# Test OCR endpoint directly
curl -X POST http://localhost:8000/api/parse-document \
  -F "file=@test.pdf" \
  -H "Content-Type: multipart/form-data"
```

### Still Having Issues?

1. Check browser console for detailed error messages
2. Check Node.js backend console logs
3. Check Python backend console logs
4. Verify all environment variables are set
5. Ensure both backends are running simultaneously

