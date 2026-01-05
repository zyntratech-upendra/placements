from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from database import get_db
from services.pdf_service import extract_text_from_pdf
from services.llm_service import generate_questions
import uuid
from datetime import datetime
from typing import Optional

router = APIRouter()

@router.post("/create-session")
async def create_session(
    request: Request,
    interview_mode: str = Form(...),  # "general" or "company"
    job_description: str = Form(None),
    resume: UploadFile = File(None),
    duration: int = Form(...),
    interview_type: str = Form("technical"),
    company_id: Optional[str] = Form(None)
):
    user_id = request.state.user["_id"]

    if interview_mode not in ["general", "company"]:
        raise HTTPException(status_code=400, detail="Invalid interview mode. Must be 'general' or 'company'")
    
    if interview_type not in ["technical", "hr"]:
        raise HTTPException(status_code=400, detail="Invalid interview type. Must be 'technical' or 'hr'")

    questions = []
    resume_text = ""
    session_company_id = None

    if interview_mode == "general":
        # General interview - generate questions using LLM
        if not job_description:
            raise HTTPException(status_code=400, detail="Job description is required for general interview")
        if not resume:
            raise HTTPException(status_code=400, detail="Resume is required for general interview")
        
        resume_bytes = await resume.read()
        resume_text = extract_text_from_pdf(resume_bytes)

        questions = generate_questions(
            job_description,
            resume_text,
            duration,
            interview_type
        )
    else:
        # Company-based interview - get questions from database
        if not company_id:
            raise HTTPException(status_code=400, detail="Company ID is required for company-based interview")
        
        session_company_id = company_id
        
        with get_db() as db:
            # Verify company exists
            company = db.companies.find_one({"id": company_id})
            if not company:
                raise HTTPException(status_code=404, detail="Company not found")
            
            # Get questions for this company and interview type
            company_questions = list(db.company_questions.find({
                "company_id": company_id,
                "interview_type": interview_type
            }))
            
            if not company_questions:
                raise HTTPException(
                    status_code=404, 
                    detail=f"No {interview_type} questions found for this company"
                )
            
            # Calculate how many questions to use based on duration (90 seconds per question)
            max_questions = max(1, duration // 90)
            
            # Select questions (if more than needed, take first N)
            selected_questions = company_questions[:max_questions]
            
            # Format questions to match the expected structure
            questions = []
            for idx, q in enumerate(selected_questions, 1):
                questions.append({
                    "id": f"q{idx}",
                    "text": q["question_text"],
                    "estimated_seconds": 90
                })
            
            # Use company name as job description for display
            if not job_description:
                job_description = f"Interview for {company['name']}"

    session_id = str(uuid.uuid4())

    with get_db() as db:
        session_data = {
            "id": session_id,
            "user_id": user_id,
            "interview_mode": interview_mode,
            "job_description": job_description or "",
            "resume_text": resume_text,
            "duration_seconds": duration,
            "interview_type": interview_type,
            "questions": questions,
            "status": "created",
            "final_score": None,
            "created_at": datetime.utcnow(),
            "completed_at": None
        }
        
        if session_company_id:
            session_data["company_id"] = session_company_id
        
        db.interview_sessions.insert_one(session_data)

    return {
        "session_id": session_id,
        "questions": questions,
        "duration_seconds": duration,
        "interview_type": interview_type,
        "interview_mode": interview_mode,
        "company_id": session_company_id
    }


@router.get("/session/{session_id}")
async def get_session(session_id: str, request: Request):
    user_id = request.state.user["_id"]

    with get_db() as db:
        session = db.interview_sessions.find_one({
            "id": session_id,
            "user_id": user_id
        })

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        session.pop("_id", None)

        answers = list(db.interview_answers.find({"session_id": session_id}))
        for a in answers:
            a.pop("_id", None)

    return {
        "session": session,
        "answers": answers
    }



@router.get("/my-sessions")
async def get_my_sessions(request: Request):
    # ✅ AUTH CHECK (prevents crash)
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # ✅ FIXED KEY NAME
    user_id = request.state.user["_id"]

    print("Fetching sessions for user:", user_id)

    with get_db() as db:
        sessions = list(
            db.interview_sessions
            .find({"user_id": user_id})
            .sort("created_at", -1)
        )

        for s in sessions:
            s.pop("_id", None)

    return {"sessions": sessions}
