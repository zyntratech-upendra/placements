# Installing Poppler on Windows

## Quick Installation Guide

Poppler is required for PDF to image conversion. Follow these steps:

### Option 1: Using Pre-built Binaries (Recommended)

1. **Download Poppler for Windows:**
   - Go to: https://github.com/oschwartz10612/poppler-windows/releases
   - Download the latest `Release-XX.XX.X-X.zip` file (e.g., `Release-23.11.0-0.zip`)

2. **Extract the ZIP file:**
   - Extract to a location like `C:\poppler` or `C:\Program Files\poppler`
   - You should see a `bin` folder inside

3. **Add to PATH:**
   - Press `Win + X` and select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find and select "Path", then click "Edit"
   - Click "New" and add the path to the `bin` folder (e.g., `C:\poppler\Library\bin`)
   - Click "OK" on all dialogs

4. **Verify Installation:**
   - Open a **new** Command Prompt or PowerShell window
   - Run: `pdftoppm -h`
   - You should see help text (not "command not found")

### Option 2: Using Chocolatey (If you have it)

```powershell
choco install poppler
```

### Option 3: Using Conda (If you use Conda)

```bash
conda install -c conda-forge poppler
```

## Verify Installation

After installation, restart your Python backend and test:

```python
from pdf2image import convert_from_bytes
import io

# Test with a simple PDF
with open('test.pdf', 'rb') as f:
    pdf_bytes = f.read()
    
images = convert_from_bytes(pdf_bytes)
print(f"Successfully converted {len(images)} pages")
```

## Troubleshooting

### "Command not found" after adding to PATH
- **Solution:** Close and reopen your terminal/IDE
- Restart your Python backend server

### Still getting "poppler not found"
- Verify the `bin` folder contains `pdftoppm.exe`
- Check PATH includes the correct `bin` folder path
- Try using absolute path in code (see below)

### Using Absolute Path (Alternative)

If PATH doesn't work, you can set it in your Python code:

```python
import os
os.environ['PATH'] += r';C:\poppler\Library\bin'  # Adjust path as needed
```

Or set it as an environment variable before running:
```powershell
$env:PATH += ";C:\poppler\Library\bin"
python main.py
```

## After Installation

1. **Restart your Python backend:**
   ```bash
   cd interview-backend
   python main.py
   ```

2. **Test OCR processing** - The error should be resolved!

