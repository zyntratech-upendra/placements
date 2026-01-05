from fastapi import APIRouter, HTTPException, Request, Form
from database import get_db
from bson import ObjectId
import uuid
from datetime import datetime
from typing import List, Optional

router = APIRouter()

def is_admin(user: dict) -> bool:
    """Check if user is admin"""
    return user and user.get("role") == "admin"

@router.post("/companies")
async def create_company(request: Request, name: str = Form(...), description: Optional[str] = Form(None)):
    """Create a new company (Admin only)"""
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if not is_admin(request.state.user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user_id = request.state.user["_id"]
    
    with get_db() as db:
        # Check if company with same name already exists
        existing = db.companies.find_one({"name": name.strip()})
        if existing:
            raise HTTPException(status_code=400, detail="Company with this name already exists")
        
        company_id = str(uuid.uuid4())
        company = {
            "id": company_id,
            "name": name.strip(),
            "description": description.strip() if description else "",
            "created_by": user_id,
            "created_at": datetime.utcnow()
        }
        
        db.companies.insert_one(company)
        company.pop("_id", None)
    
    return {
        "success": True,
        "company": company
    }

@router.get("/companies")
async def get_companies(request: Request):
    """Get all companies (Available to all authenticated users)"""
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    with get_db() as db:
        companies = list(db.companies.find().sort("name", 1))
        for company in companies:
            company.pop("_id", None)
            # Get question count for each company
            question_count = db.company_questions.count_documents({"company_id": company["id"]})
            company["question_count"] = question_count
    
    return {
        "success": True,
        "companies": companies
    }

@router.get("/companies/{company_id}")
async def get_company(company_id: str, request: Request):
    """Get company details with questions"""
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    with get_db() as db:
        company = db.companies.find_one({"id": company_id})
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        company.pop("_id", None)
        
        # Get questions for this company
        questions = list(db.company_questions.find({"company_id": company_id}))
        for q in questions:
            q.pop("_id", None)
        
        company["questions"] = questions
    
    return {
        "success": True,
        "company": company
    }

@router.post("/companies/{company_id}/questions")
async def add_company_question(
    request: Request,
    company_id: str,
    question_text: str = Form(...),
    interview_type: str = Form("technical"),
    difficulty: Optional[str] = Form(None)
):
    """Add a question to a company (Admin only)"""
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if not is_admin(request.state.user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if interview_type not in ["technical", "hr"]:
        raise HTTPException(status_code=400, detail="Invalid interview type. Must be 'technical' or 'hr'")
    
    user_id = request.state.user["_id"]
    
    with get_db() as db:
        # Verify company exists
        company = db.companies.find_one({"id": company_id})
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        question_id = str(uuid.uuid4())
        question = {
            "id": question_id,
            "company_id": company_id,
            "question_text": question_text.strip(),
            "interview_type": interview_type,
            "difficulty": difficulty.strip() if difficulty else "medium",
            "created_by": user_id,
            "created_at": datetime.utcnow()
        }
        
        db.company_questions.insert_one(question)
        question.pop("_id", None)
    
    return {
        "success": True,
        "question": question
    }

@router.post("/companies/{company_id}/questions/bulk")
async def add_company_questions_bulk(
    request: Request,
    company_id: str,
    questions: str = Form(...),  # JSON string of questions array
    interview_type: str = Form("technical")
):
    """Add multiple questions to a company at once (Admin only)"""
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if not is_admin(request.state.user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if interview_type not in ["technical", "hr"]:
        raise HTTPException(status_code=400, detail="Invalid interview type. Must be 'technical' or 'hr'")
    
    import json
    try:
        questions_list = json.loads(questions)
        if not isinstance(questions_list, list):
            raise ValueError("Questions must be a JSON array")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for questions")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    user_id = request.state.user["_id"]
    
    with get_db() as db:
        # Verify company exists
        company = db.companies.find_one({"id": company_id})
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        inserted_questions = []
        for q_text in questions_list:
            if not isinstance(q_text, str) or not q_text.strip():
                continue
            
            question_id = str(uuid.uuid4())
            question = {
                "id": question_id,
                "company_id": company_id,
                "question_text": q_text.strip(),
                "interview_type": interview_type,
                "difficulty": "medium",
                "created_by": user_id,
                "created_at": datetime.utcnow()
            }
            
            db.company_questions.insert_one(question)
            question.pop("_id", None)
            inserted_questions.append(question)
    
    return {
        "success": True,
        "count": len(inserted_questions),
        "questions": inserted_questions
    }

@router.delete("/companies/{company_id}")
async def delete_company(company_id: str, request: Request):
    """Delete a company and all its questions (Admin only)"""
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if not is_admin(request.state.user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    with get_db() as db:
        company = db.companies.find_one({"id": company_id})
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Delete all questions for this company
        db.company_questions.delete_many({"company_id": company_id})
        
        # Delete the company
        db.companies.delete_one({"id": company_id})
    
    return {
        "success": True,
        "message": "Company and all associated questions deleted"
    }

@router.delete("/companies/{company_id}/questions/{question_id}")
async def delete_company_question(company_id: str, question_id: str, request: Request):
    """Delete a question from a company (Admin only)"""
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if not is_admin(request.state.user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    with get_db() as db:
        question = db.company_questions.find_one({
            "id": question_id,
            "company_id": company_id
        })
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        db.company_questions.delete_one({"id": question_id})
    
    return {
        "success": True,
        "message": "Question deleted"
    }

