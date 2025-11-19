import re
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image, ImageFilter
import io
import os
import platform
import logging

logger = logging.getLogger(__name__)

class OCRProcessor:
    def __init__(self):
        self._configure_tesseract()
        self.debug_mode = os.getenv('DEBUG_OCR', 'false').lower() == 'true'

    # -------------------------------------------------------------------
    #  CONFIGURE TESSERACT
    # -------------------------------------------------------------------
    def _configure_tesseract(self):
        tesseract_path = os.getenv('TESSERACT_CMD')

        if tesseract_path and os.path.exists(tesseract_path):
            pytesseract.pytesseract.tesseract_cmd = tesseract_path

        elif platform.system() == 'Windows':
            paths = [
                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
            ]
            for p in paths:
                if os.path.exists(p):
                    pytesseract.pytesseract.tesseract_cmd = p
                    return
            raise Exception("Install Tesseract from UB Mannheim")

        elif platform.system() == 'Darwin':
            paths = ["/usr/local/bin/tesseract", "/opt/homebrew/bin/tesseract"]
            for p in paths:
                if os.path.exists(p):
                    pytesseract.pytesseract.tesseract_cmd = p
                    return

        elif platform.system() == 'Linux':
            pytesseract.pytesseract.tesseract_cmd = "tesseract"

    # -------------------------------------------------------------------
    #  PREPROCESSING (SIMPLE AND SAFE)
    # -------------------------------------------------------------------
    def _preprocess_image(self, image):
        try:
            image = image.convert("L")  # grayscale
            image = image.filter(ImageFilter.SHARPEN)
            return image
        except:
            return image

    # -------------------------------------------------------------------
    #  OCR ENGINE CONFIG
    # -------------------------------------------------------------------
    def _ocr(self, image):
        config = r"--oem 3 --psm 4 -c preserve_interword_spaces=1"
        return pytesseract.image_to_string(image, config=config)

    def extract_text_from_pdf(self, file_bytes):
        pages = convert_from_bytes(file_bytes, dpi=300)
        full_text = ""
        for pg in pages:
            processed = self._preprocess_image(pg)
            full_text += self._ocr(processed) + "\n"
        return full_text

    def extract_text_from_image(self, file_bytes):
        img = Image.open(io.BytesIO(file_bytes))
        processed = self._preprocess_image(img)
        return self._ocr(processed)

    def extract_text(self, file_bytes, file_type):
        ft = file_type.lower()
        if ft == "pdf":
            return self.extract_text_from_pdf(file_bytes)
        if ft in ["jpg", "jpeg", "png"]:
            return self.extract_text_from_image(file_bytes)
        raise ValueError("Unsupported file type: " + file_type)

    # -------------------------------------------------------------------
    #  CLEAN TEXT
    # -------------------------------------------------------------------
    def _clean_text(self, txt):
        txt = txt.replace("■", "").replace("□", "").replace("●", "")
        return re.sub(r"\s+", " ", txt).strip()

    # -------------------------------------------------------------------
    #  DETECT QUESTION START
    # -------------------------------------------------------------------
    def _is_question_start(self, line):
        return bool(re.match(r"^(Q\.|Question:?|\d+\.|\d+\))", line.strip(), re.IGNORECASE))

    # -------------------------------------------------------------------
    #  OPTION LINES (A/B/C/D)
    # -------------------------------------------------------------------
    def _is_option_line(self, line):
        return bool(re.match(r"^[A-D][\)\.\:\-\s]", line.strip(), re.IGNORECASE))

    # -------------------------------------------------------------------
    #  STRICT ANSWER DETECTION
    # -------------------------------------------------------------------
    def _is_answer_line(self, line):
        stripped = line.strip().lower()
        return bool(re.match(r"^(answer|ans|correct answer)\b", stripped))

    # -------------------------------------------------------------------
    #  EXTRACT TEXT FOR OPTION
    # -------------------------------------------------------------------
    def _extract_option_text(self, line):
        text = re.sub(r"^[A-D][\)\.\:\-\s]*", "", line.strip(), flags=re.IGNORECASE)
        return self._clean_text(text)

    # -------------------------------------------------------------------
    #  FIXED ANSWER EXTRACTION (NO MORE WRONG "A")
    # -------------------------------------------------------------------
    def _extract_answer(self, line):
        line = line.strip()

        # Only match letters after Answer/Ans keyword
        match = re.search(
            r"(answer|ans|correct answer)\s*[:\-\(\s]*([A-D])",
            line,
            re.IGNORECASE
        )

        if match:
            return match.group(2).upper()

        # Standalone answer like "A"
        if re.fullmatch(r"[A-D]", line.upper()):
            return line.upper()

        return None

    # -------------------------------------------------------------------
    #  PARSE QUESTIONS
    # -------------------------------------------------------------------
    def parse_questions(self, text):
        questions = []
        lines = text.split("\n")

        current = None

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            # New question
            if self._is_question_start(stripped):
                if current and len(current["options"]) >= 2:
                    questions.append(current)

                qtext = re.sub(r"^(Q\.|Question:?|\d+\.|\d+\))", "", stripped, flags=re.IGNORECASE)

                current = {
                    "text": self._clean_text(qtext),
                    "options": [],
                    "answer": None,
                    "section": "General"
                }
                continue

            # Options
            if current and self._is_option_line(stripped):
                opt = self._extract_option_text(stripped)
                current["options"].append(opt)
                continue

            # Answer lines
            if current and self._is_answer_line(stripped):
                ans = self._extract_answer(stripped)
                if ans:
                    current["answer"] = ans
                continue

            # Standalone answer
            if current and re.fullmatch(r"[A-D]", stripped.upper()):
                current["answer"] = stripped.upper()
                continue

            # Continue question text
            if current and len(current["options"]) < 4:
                current["text"] += " " + stripped

        # Save last question
        if current and len(current["options"]) >= 2:
            questions.append(current)

        return questions

    # -------------------------------------------------------------------
    #  VALIDATE QUESTION
    # -------------------------------------------------------------------
    def validate_question(self, q):
        return bool(q.get("text")) and len(q.get("options", [])) >= 2

    # -------------------------------------------------------------------
    #  MAIN PROCESSOR
    # -------------------------------------------------------------------
    def process_document(self, file_bytes, file_type):
        try:
            text = self.extract_text(file_bytes, file_type)

            questions = self.parse_questions(text)
            valid = [q for q in questions if self.validate_question(q)]

            return {
                "success": len(valid) > 0,
                "questions": valid,
                "total_extracted": len(questions),
                "total_valid": len(valid),
                "error": None if valid else "No valid questions found",
                "raw_text": text
            }

        except Exception as e:
            return {
                "success": False,
                "questions": [],
                "error": str(e),
                "total_extracted": 0,
                "total_valid": 0
            }
