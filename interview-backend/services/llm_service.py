import json
import logging
from groq import Groq
from config import get_settings, get_settingsgpt
from openai import OpenAI


# ---------------------------
# CLIENT HELPERS
# ---------------------------

def get_client():
    """Lazy initialization of Groq client."""
    settings = get_settings()
    if not settings.groq_api_key:
        raise ValueError("GROQ_API_KEY is required. Please set it in your .env file.")
    return Groq(api_key=settings.groq_api_key)


def get_clientgpt():
    """Lazy initialization of OpenAI client."""
    settingsgpt = get_settingsgpt()
    if not settingsgpt.openai_api_key:
        raise ValueError("OPENAI_API_KEY is required. Please set it in your .env file.")
    return OpenAI(api_key=settingsgpt.openai_api_key)


# ---------------------------
# QUESTION GENERATION LOGIC
# ---------------------------

def calculate_question_count(duration_seconds: int, seconds_per_question: int = 90) -> int:
    """
    Rule:
    - Each question = 90 seconds.
    - Total questions = floor(duration / 90).
    - Minimum 1 question.
    """
    return max(1, duration_seconds // seconds_per_question)


def generate_questions(job_description: str, resume_text: str, duration_seconds: int) -> list:
    logger = logging.getLogger("backend.llm_service")

    # 1. Decide number of questions based on duration
    question_count = calculate_question_count(duration_seconds)

    # 2. Try initializing Groq client
    try:
        client = get_client()
    except ValueError as e:
        logger.warning(f"{e} Falling back to stub questions.")
        # Fallback default
        return [
            {
                "id": "q1",
                "text": "Describe a project where you demonstrated problem-solving skills.",
                "estimated_seconds": min(180, max(30, int(duration_seconds / 3)))
            }
        ]

    # 3. System Prompt enforcing strict JSON + fixed number of questions
    system_prompt = f"""
You are an expert interviewer.
Produce ONLY valid JSON in this exact structure:
{{
  "questions": [
     {{"id": "q1", "text": "Example question?", "estimated_seconds": 90}}
  ]
}}

RULES:
- Generate exactly {question_count} questions.
- IDs must be q1, q2, q3 ... in order.
- Each question MUST relate to the job description & resume.
- Each question MUST have "estimated_seconds": 90.
- Do NOT include explanations. Output ONLY JSON.
"""

    # 4. User prompt containing JD, resume, and total time
    user_prompt = f"""
Job Description:
{job_description}

Resume:
{resume_text}

Total Interview Duration (seconds): {duration_seconds}

Generate exactly {question_count} structured interview questions.
"""

    # 5. Call Groq LLM
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
        )
    except Exception as e:
        raise ValueError(f"Error calling Groq API: {str(e)}") from e

    content = response.choices[0].message.content.strip()

    # 6. Parse JSON from Groq response
    try:
        result = json.loads(content)
        return result.get("questions", [])

    except json.JSONDecodeError:
        # Fix JSON if wrapped in ``` blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        result = json.loads(content)
        return result.get("questions", [])


# ---------------------------
# GENERATE IDEAL REFERENCE ANSWERS
# ---------------------------

def generate_reference_answer(question: str, jd: str, resume: str):
    client = get_client()
    system_prompt = """You are an interview expert. Write a concise, high-quality, ideal answer to the question below."""
    
    user_prompt = f"""
Job Description:
{jd}

Resume Summary:
{resume}

Question:
{question}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.5,
        max_tokens=500,
    )
    
    return response.choices[0].message.content.strip()


# ---------------------------
# ANSWER EVALUATION
# ---------------------------

def evaluate_answer(question: str, transcript: str, reference_answer: str) -> dict:
    client = get_clientgpt()

    system_prompt = """
You are an expert interviewer. Evaluate the answer strictly.
Return ONLY JSON in this form:
{
  "scores": {
    "relevance": int,
    "accuracy": int,
    "depth": int,
    "clarity": int,
    "fit": int
  },
  "total_score": int,
  "feedback": ["point 1", "point 2"],
  "comparison_summary": "short comparison"
}
"""

    user_prompt = f"""
Question: {question}

Candidate Answer:
{transcript}

Ideal Reference Answer:
{reference_answer}

Score objectively. Penalize vague or incorrect answers.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,
        max_tokens=1000,
    )

    content = response.choices[0].message.content.strip()

    # Parse JSON safely
    try:
        return json.loads(content)

    except json.JSONDecodeError:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        return json.loads(content)
