# 🎓 College Placement Portal

A comprehensive **full-stack** placement management system with role-based authentication, AI-powered interview assessments, MCQ question extraction, and beautiful UI built with React and Tailwind CSS.

![Built with](https://img.shields.io/badge/Built%20with-MERN-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![React](https://img.shields.io/badge/Frontend-React-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-teal)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-blueviolet)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Mentor, Student)
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### 👨‍💼 Admin Dashboard
- **User Management**: Create and manage students, mentors, and admins
- **Company Folders**: Create folders for different companies (Infosys, TCS, Wipro, etc.)
- **File Upload**: Upload question papers (PDF, DOC, DOCX, Images)
- **OCR Processing**: Extract MCQ questions from uploaded files using GPT-4o-mini Vision API
- **Assessment Creation**: Create scheduled and practice assessments
- **Interview Company Management**: Create companies and add interview questions
- **Performance Monitoring**: View all student attempts and analytics

### 🎤 AI-Powered Interview System
- **General Interviews**: AI-generated questions based on job description and resume
- **Company-Based Interviews**: Pre-configured questions from company database
- **Real-time Audio Recording**: Record answers during interview
- **Speech-to-Text**: Automatic transcription using OpenAI Whisper
- **AI Evaluation**: LLM-based answer scoring and feedback
- **PDF Reports**: Generate detailed interview reports

### 👨‍🏫 Mentor Dashboard
- Create and manage assessments
- Monitor student performance
- View detailed attempt analytics
- Track company-wise performance
- Generate reports

### 🎓 Student Dashboard
- **Practice by Company**: Take random practice tests for any company
- **Scheduled Assessments**: Participate in scheduled exams
- **AI Interviews**: Take general or company-based interviews
- **Real-time Assessment**: Timer-based tests with auto-submit
- **Results & Analytics**: View scores, percentages, and performance history
- **Progress Tracking**: Monitor improvement over time

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python 3.11+
- MongoDB (Local or Atlas)
- npm or yarn
- OpenAI API Key (for interview features)

### Installation

**1. Clone the repository**
```bash
git clone <repository-url>
cd placements
```

**2. Setup Node.js Backend (Main Backend)**
```bash
cd backend-code
npm install
```

Create `.env` file in `backend-code/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

Create uploads folder and seed admin:
```bash
mkdir uploads
npm run seed
```

**3. Setup Python Backend (Interview Backend)**
```bash
cd interview-backend
pip install -r requirements.txt
```

Create `.env` file in `interview-backend/`:
```env
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=ai_interviewer
JWT_SECRET=your_secret_key_here
```

**4. Setup Frontend**
```bash
cd ..
npm install
```

**5. Run the Application**

Terminal 1 (Node.js Backend):
```bash
cd backend-code
npm run dev
```

Terminal 2 (Python Backend):
```bash
cd interview-backend
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 3 (Frontend):
```bash
npm run dev
```

**6. Access the Application**
- Frontend: http://localhost:5173
- Node.js Backend API: http://localhost:5000
- Python Backend API: http://localhost:8000

**7. Login Credentials**
```
Admin:
Email: pranav2005@gmail.com
Password: VP@2309
```

---

## 📁 Project Structure

```
placements/
│
├── backend-code/              # Node.js + Express Backend (Main Backend)
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Folder.js
│   │   ├── File.js
│   │   ├── ParsedQuestion.js
│   │   ├── Assessment.js
│   │   └── Attempt.js
│   ├── controllers/          # Request handlers
│   ├── routes/               # API routes
│   ├── middleware/           # Auth middleware
│   ├── utils/
│   │   └── seedAdmin.js      # Admin seeder
│   ├── uploads/              # File storage
│   └── server.js             # Entry point
│
├── interview-backend/         # Python + FastAPI Backend (Interview System)
│   ├── routes/
│   │   ├── session.py        # Interview session management
│   │   ├── upload.py         # Audio upload & transcription
│   │   ├── analyze.py        # Answer evaluation
│   │   ├── ocr.py            # Document parsing
│   │   └── companies.py      # Company management
│   ├── services/
│   │   ├── llm_service.py    # Question generation & evaluation
│   │   ├── transcription_service.py  # Speech-to-text
│   │   ├── ocr_processor.py  # MCQ extraction
│   │   ├── pdf_service.py    # PDF text extraction
│   │   └── export_service.py # PDF report generation
│   ├── middleware/
│   │   └── auth.py           # JWT authentication
│   ├── database.py           # MongoDB connection
│   ├── config.py             # Configuration
│   └── main.py               # Entry point
│
├── src/                      # React Frontend
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── admin/
│   │   │   ├── FolderManagement.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── AssessmentManagement.jsx
│   │   │   └── CompanyManagement.jsx
│   │   └── Interview-frontend/
│   │       ├── SetupScreen.jsx
│   │       ├── InterviewScreen.jsx
│   │       └── ResultsScreen.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── MentorDashboard.jsx
│   │   ├── Interview.jsx
│   │   └── TakeAssessment.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── config/
│   │   └── api.js
│   └── App.jsx
│
└── Documentation Files
    ├── BACKEND_SETUP.md       # Backend setup guide
    ├── PROJECT_GUIDE.md       # Complete documentation
    ├── MONGODB_REFERENCE.md   # MongoDB queries
    ├── QUICK_START.md         # Quick start guide
    └── OCR_TROUBLESHOOTING.md # OCR troubleshooting
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend (Node.js)
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

### Backend (Python)
- **FastAPI** - Web framework
- **PyMongo** - MongoDB driver
- **OpenAI** - GPT-4o-mini for interviews & OCR
- **Groq** - LLM API
- **PyMuPDF** - PDF processing (no external dependencies)
- **ReportLab** - PDF generation
- **python-jose** - JWT handling

---

## 📊 Database Schema

### Main Backend Collections (placement_portal database)

1. **Users**
   - Stores admin, mentor, and student information
   - Fields: name, email, password (hashed), role, rollNumber, department, batch

2. **Folders**
   - Company-wise question organization
   - Fields: name, companyName, description, fileCount

3. **Files**
   - Uploaded question papers
   - Fields: filename, originalName, filePath, fileType, ocrStatus

4. **ParsedQuestions**
   - Extracted questions from files
   - Fields: questionText, options[], correctAnswer, difficulty, topic

5. **Assessments**
   - Created tests
   - Fields: title, companyName, questions[], duration, totalMarks, assessmentType

6. **Attempts**
   - Student test submissions
   - Fields: student, assessment, answers[], totalScore, percentage, status

### Interview Backend Collections (ai_interviewer database)

1. **interview_sessions**
   - Interview session data
   - Fields: id, user_id, interview_mode, job_description, resume_text, duration_seconds, interview_type, questions[], status, final_score, company_id, created_at, completed_at

2. **interview_answers**
   - Candidate answers
   - Fields: id, session_id, question_id, audio_path, transcript, score, feedback[], model_answer, created_at, updated_at

3. **companies**
   - Interview companies
   - Fields: id, name, description, created_by, created_at

4. **company_questions**
   - Company-specific interview questions
   - Fields: id, company_id, question_text, interview_type, difficulty, created_by, created_at

---

## 🔑 API Endpoints

### Main Backend (Node.js - Port 5000)

#### Authentication
```
POST   /api/auth/login              Login
POST   /api/auth/register           Register new user (Admin only)
GET    /api/auth/me                 Get current user
GET    /api/auth/users              Get all users
```

#### Folders
```
POST   /api/folders                 Create folder (Admin)
GET    /api/folders                 Get all folders
GET    /api/folders/:id             Get folder details
PUT    /api/folders/:id             Update folder (Admin)
DELETE /api/folders/:id             Delete folder (Admin)
```

#### Files
```
POST   /api/files/upload            Upload file (Admin)
GET    /api/files                   Get all files
GET    /api/files/folder/:id        Get files by folder
POST   /api/files/:id/ocr            Process OCR (Admin)
DELETE /api/files/:id                Delete file (Admin)
```

#### Assessments
```
POST   /api/assessments             Create assessment
GET    /api/assessments             Get all assessments
GET    /api/assessments/:id         Get assessment details
POST   /api/assessments/random      Generate random test
PUT    /api/assessments/:id         Update assessment
DELETE /api/assessments/:id         Delete assessment
```

#### Attempts
```
POST   /api/attempts/start          Start assessment
POST   /api/attempts/answer         Submit answer
POST   /api/attempts/submit         Submit assessment
GET    /api/attempts/my-attempts    Get student's attempts
GET    /api/attempts/all            Get all attempts (Admin/Mentor)
GET    /api/attempts/:id            Get attempt details
```

### Interview Backend (Python - Port 8000)

#### Interview Sessions
```
POST   /api/create-session          Create interview session
GET    /api/session/:session_id     Get session details
GET    /api/my-sessions             Get user's sessions
```

#### Interview Answers
```
POST   /api/upload-answer/:session_id/:question_id  Upload audio answer
POST   /api/analyze/:session_id    Analyze and score answers
GET    /api/export-pdf/:session_id Generate PDF report
```

#### Companies (Admin only)
```
POST   /api/companies               Create company
GET    /api/companies               Get all companies
GET    /api/companies/:id           Get company with questions
POST   /api/companies/:id/questions Add question
POST   /api/companies/:id/questions/bulk  Bulk add questions
DELETE /api/companies/:id           Delete company
DELETE /api/companies/:id/questions/:question_id  Delete question
```

#### OCR Service
```
POST   /api/parse-document          Extract MCQ questions from PDF/images
GET    /api/health                 Health check
```

---

## 🎨 UI Features

- **Beautiful Gradients**: Modern color schemes and smooth transitions
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Real-time Updates**: Live timer and progress tracking
- **Interactive Components**: Hover effects, animations, and feedback
- **Role-based UI**: Different dashboards for each user role

### Color Palette
- Primary: Blue (#0ea5e9, #667eea)
- Success: Green (#22c55e)
- Warning: Orange (#f97316)
- Danger: Red (#ef4444)
- Purple Gradient: #667eea to #764ba2

---

## 📖 Usage Guide

### For Admins

1. **Create Users**
   - Navigate to User Management
   - Add students and mentors with credentials

2. **Organize Questions**
   - Create company folders (Infosys, TCS, etc.)
   - Upload question papers
   - Process files with OCR to extract questions

3. **Manage Interview Companies**
   - Go to Interview Companies tab
   - Create companies
   - Add interview questions (single or bulk)

4. **Create Assessments**
   - Select company folder
   - Set duration and marks
   - Choose assessment type (Practice/Scheduled)

5. **Monitor Performance**
   - View all attempts
   - Track student progress
   - Generate insights

### For Students

1. **Practice Tests**
   - Select any company
   - Get random questions
   - Practice unlimited times

2. **Take Assessments**
   - View available tests
   - Complete within time limit
   - Submit and view results

3. **Take AI Interviews**
   - Choose General Interview (AI-generated questions) or Company-Based Interview
   - Upload resume and job description (for general)
   - Select company (for company-based)
   - Record answers to questions
   - Get AI evaluation and feedback

4. **Track Progress**
   - View attempt history
   - Check scores and percentages
   - Identify improvement areas

### For Mentors

1. **Create Assessments**
   - Design custom tests
   - Select questions and duration

2. **Monitor Students**
   - View all attempts
   - Analyze performance metrics
   - Track individual progress

---

## 🔧 Configuration

### Environment Variables

**Node.js Backend (.env in `backend-code/`)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**Python Backend (.env in `interview-backend/`)**
```env
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=ai_interviewer
JWT_SECRET=your_secret_key_here
```

**Frontend**
Update API URL in `src/config/api.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Start MongoDB service
sudo systemctl start mongodb

# Check status
sudo systemctl status mongodb
```

### Port Already in Use
```bash
# Change port in backend .env
PORT=5001

# Or kill process on port
lsof -i :5000
kill -9 <PID>
```

### CORS Issues
- Ensure both backends are running
- Check API URLs in frontend match backend URLs
- Verify CORS is enabled in both backends

### OCR/Interview Backend Issues
- Ensure Python backend is running on port 8000
- Check `OPENAI_API_KEY` is set correctly
- Verify MongoDB connection for interview backend
- See `OCR_TROUBLESHOOTING.md` for detailed help

### Interview Features Not Working
- Ensure Python backend is running
- Check OpenAI API key is valid
- Verify JWT_SECRET matches in both backends
- Check browser console for errors

---

## 🎯 Interview System Features

### General Interview
- AI generates questions based on job description and resume
- Questions tailored to interview type (Technical/HR)
- Dynamic question count based on duration

### Company-Based Interview
- Pre-configured questions from company database
- Admin can create companies and add questions
- Questions filtered by interview type

### Evaluation System
- AI-powered answer evaluation
- Scoring on 5 criteria (relevance, accuracy, depth, clarity, fit)
- Detailed feedback for improvement
- Model answers for comparison
- PDF report generation

---

## 📝 Future Enhancements

- [ ] Email notifications for assessments
- [ ] Advanced analytics dashboard
- [ ] Video proctoring
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Peer comparison and leaderboards
- [ ] Company-specific preparation roadmaps
- [ ] Real-time collaboration features

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👥 Authors

Built with ❤️ for college placement preparation

---

## 📞 Support

For detailed documentation, check:
- `QUICK_START.md` - Get started quickly
- `PROJECT_GUIDE.md` - Complete guide
- `MONGODB_REFERENCE.md` - Database queries
- `BACKEND_SETUP.md` - Backend setup
- `OCR_TROUBLESHOOTING.md` - OCR troubleshooting

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with MERN Stack + FastAPI | MongoDB + Express + React + Node.js + Python**
