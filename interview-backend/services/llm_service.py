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

    # 2. Try initializing open ai client
    try:
        client = get_clientgpt()
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
            model="gpt-4o-mini",
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
    client = get_clientgpt()
    system_prompt = """
You are an experienced technical interviewer and career coach.
Your task is to write an ideal model answer to each interview question.

Guidelines:
- Carefully consider the candidate’s resume and the given job description.
- Craft a professional, confident, and concise answer that shows relevant experience, technical depth, and problem-solving ability.
- Highlight practical examples or achievements that align with the role.
- Avoid generic statements, buzzwords, or overly long explanations.
- The tone should sound natural, as if spoken by a well-prepared candidate during an interview.
- Do not include explanations, formatting, or commentary — only provide the direct answer text.
"""

    
    user_prompt = f"""
Job Description:
{jd}

Resume Summary:
{resume}

Question:
{question}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
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
You are an expert technical interviewer. Your job is to evaluate a candidate's response using a structured, consistent rubric.

Follow these rules STRICTLY:

1. Assign each category a score from 1 to 10 (integers only).
2. Base scores ONLY on the candidate’s actual text. Do NOT infer missing details.
3. Do NOT give perfect scores unless the answer fully demonstrates excellence.
4. Do NOT include any text outside the JSON. No explanations. No commentary.
5. All output must be valid JSON. If you are unsure, return the closest valid JSON.

Evaluation Criteria:

- relevance: Does the answer directly address the question asked?
- accuracy: Are the technical statements correct and free of errors?
- depth: Does the answer show reasoning, trade-offs, and understanding?
- clarity: Is the answer well-structured, clear, and concise?
- fit: Overall competency for the role based on the answer quality.

Output Format (strict):

{
  "scores": {
    "relevance": int,
    "accuracy": int,
    "depth": int,
    "clarity": int,
    "fit": int
  },
  "total_score": float,
  "feedback": [
    "Short, specific point of improvement",
    "Short, specific strength",
    "Another short, specific note"
  ],
  "comparison_summary": "1–2 sentence comparison with an ideal expert-level answer."
}

Compute total_score as the average of the five category scores, then scale it to a value between 1 and 10 (rounded to one decimal place).

Return ONLY this JSON. No other text.
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
