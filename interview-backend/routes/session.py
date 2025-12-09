from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from database import get_db
from services.pdf_service import extract_text_from_pdf
from services.llm_service import generate_questions
import json
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/create-session")
async def create_session(
    job_description: str = Form(...),
    resume: UploadFile = File(...),
    duration: int = Form(...)
):
    try:
        resume_bytes = await resume.read()
        resume_text = extract_text_from_pdf(resume_bytes)

        questions = generate_questions(job_description, resume_text, duration)

        session_id = str(uuid.uuid4())

        with get_db() as db:
            session_doc = {
                "id": session_id,
                "job_description": job_description,
                "resume_text": resume_text,
                "duration_seconds": duration,
                "questions": questions,
                "status": "created",
                "created_at": datetime.utcnow()
            }
            db.interview_sessions.insert_one(session_doc)

        return {
            "session_id": session_id,
            "questions": questions,
            "duration_seconds": duration
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session/{session_id}")
async def get_session(session_id: str):
    try:
        with get_db() as db:
            session = db.interview_sessions.find_one({"id": session_id})

            if not session:
                raise HTTPException(status_code=404, detail="Session not found")

            session.pop("_id", None)

            answers = list(db.interview_answers.find({"session_id": session_id}))

            for answer in answers:
                answer.pop("_id", None)

        return {
            "session": session,
            "answers": answers
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
