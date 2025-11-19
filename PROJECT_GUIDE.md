# College Placement Portal - Complete Setup Guide

## Project Overview

A full-stack MERN (MongoDB, Express, React, Node.js) placement portal with role-based authentication and beautiful Tailwind CSS UI.

### Features
- **Role-based Authentication**: Admin, Mentor, Student
- **Admin Panel**: User management, folder/file management, assessment creation
- **Mentor Panel**: Create assessments, monitor student performance
- **Student Panel**: Take assessments, practice tests, view results
- **File Upload & OCR Processing**: Upload question papers with simulated OCR
- **Real-time Assessment**: Timer-based assessments with auto-submit

---

## Backend Setup (MongoDB + Express)

### 1. Prerequisites
- Node.js (v16 or higher)
- MongoDB installed and running locally OR MongoDB Atlas account

### 2. Navigate to Backend Folder
```bash
cd backend-code
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Create Environment File
Create a `.env` file in the `backend-code` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
Replace `MONGODB_URI` with your MongoDB Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placement_portal?retryWrites=true&w=majority
```

### 5. Create Uploads Directory
```bash
mkdir uploads
```

### 6. Seed Admin User
```bash
npm run seed
```

This creates the admin account:
- **Email**: pranav2005@gmail.com
- **Password**: VP@2309

### 7. Start Backend Server
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

---

## Frontend Setup (React + Vite + Tailwind)

### 1. Navigate to Project Root
```bash
cd ..
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Start Frontend Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## Usage Guide

### Login Credentials

**Admin:**
- Email: pranav2005@gmail.com
- Password: VP@2309

### Admin Workflow

1. **Login** as admin
2. **Create Users**:
   - Go to "User Management" tab
   - Click "+ Add User"
   - Fill in details and select role (Student/Mentor)
   - Click "Create User"

3. **Create Company Folders**:
   - Go to "Folders & Files" tab
   - Click "+ Create Folder"
   - Enter company name (e.g., "Infosys", "TCS", "Wipro")
   - Click "Create"

4. **Upload Question Files**:
   - Click on a folder
   - Click "+ Upload File"
   - Select PDF/DOC/Image file
   - Click "Upload"
   - Click "Process OCR" to parse questions

5. **Create Assessments**:
   - Go to "Assessments" tab
   - Click "+ Create Assessment"
   - Fill in details and select folder
   - Click "Create"

### Student Workflow

1. **Login** with student credentials (created by admin)
2. **Practice by Company**:
   - Click on any company card
   - System generates random questions
   - Click "Start Practice"

3. **Take Assessment**:
   - View available assessments
   - Click "Start Assessment"
   - Answer questions
   - Submit before time runs out

4. **View Results**:
   - See "My Attempts" section
   - View scores and percentages

### Mentor Workflow

1. **Login** with mentor credentials
2. **Create Assessments**:
   - Click "+ Create Assessment"
   - Configure assessment details
   - Click "Create"

3. **Monitor Students**:
   - View all student attempts
   - Click "View Attempts" on any assessment
   - See detailed performance metrics

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user (Admin only)
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (Admin/Mentor)

### Folders
- `POST /api/folders` - Create folder (Admin)
- `GET /api/folders` - Get all folders
- `GET /api/folders/:id` - Get folder with files
- `PUT /api/folders/:id` - Update folder (Admin)
- `DELETE /api/folders/:id` - Delete folder (Admin)

### Files
- `POST /api/files/upload` - Upload file (Admin)
- `GET /api/files` - Get all files
- `GET /api/files/folder/:folderId` - Get files by folder
- `POST /api/files/:id/ocr` - Process OCR (Admin)
- `DELETE /api/files/:id` - Delete file (Admin)

### Assessments
- `POST /api/assessments` - Create assessment (Admin/Mentor)
- `GET /api/assessments` - Get all assessments
- `GET /api/assessments/:id` - Get assessment details
- `POST /api/assessments/random` - Generate random assessment
- `PUT /api/assessments/:id` - Update assessment (Admin/Mentor)
- `DELETE /api/assessments/:id` - Delete assessment (Admin/Mentor)

### Attempts
- `POST /api/attempts/start` - Start assessment (Student)
- `POST /api/attempts/answer` - Submit answer (Student)
- `POST /api/attempts/submit` - Submit assessment (Student)
- `GET /api/attempts/my-attempts` - Get student's attempts (Student)
- `GET /api/attempts/all` - Get all attempts (Admin/Mentor)
- `GET /api/attempts/assessment/:id` - Get attempts by assessment (Admin/Mentor)
- `GET /api/attempts/:id` - Get attempt details

---

## MongoDB Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'mentor' | 'student',
  rollNumber: String,
  department: String,
  batch: String,
  createdBy: ObjectId,
  timestamps: true
}
```

### Folder Collection
```javascript
{
  name: String,
  companyName: String,
  description: String,
  createdBy: ObjectId (User),
  fileCount: Number,
  timestamps: true
}
```

### File Collection
```javascript
{
  filename: String,
  originalName: String,
  filePath: String,
  fileType: String,
  fileSize: Number,
  folder: ObjectId (Folder),
  uploadedBy: ObjectId (User),
  ocrProcessed: Boolean,
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed',
  timestamps: true
}
```

### ParsedQuestion Collection
```javascript
{
  fileId: ObjectId (File),
  folderId: ObjectId (Folder),
  questionText: String,
  options: [String],
  correctAnswer: String,
  difficulty: 'easy' | 'medium' | 'hard',
  topic: String,
  questionType: 'mcq' | 'coding' | 'descriptive',
  timestamps: true
}
```

### Assessment Collection
```javascript
{
  title: String,
  description: String,
  companyName: String,
  folder: ObjectId (Folder),
  questions: [ObjectId (ParsedQuestion)],
  duration: Number (minutes),
  totalMarks: Number,
  scheduledDate: Date,
  endDate: Date,
  isActive: Boolean,
  isPractice: Boolean,
  createdBy: ObjectId (User),
  allowedStudents: [ObjectId (User)],
  assessmentType: 'scheduled' | 'practice' | 'random',
  timestamps: true
}
```

### Attempt Collection
```javascript
{
  assessment: ObjectId (Assessment),
  student: ObjectId (User),
  answers: [{
    questionId: ObjectId (ParsedQuestion),
    selectedAnswer: String,
    isCorrect: Boolean,
    marksObtained: Number
  }],
  startTime: Date,
  endTime: Date,
  totalScore: Number,
  percentage: Number,
  status: 'in_progress' | 'completed' | 'submitted',
  timeTaken: Number (seconds),
  timestamps: true
}
```

---

## Technology Stack

### Frontend
- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads

---

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `sudo systemctl start mongod`
- Check MongoDB status: `sudo systemctl status mongod`
- Verify connection string in `.env`

### Port Already in Use
- Change `PORT` in backend `.env` file
- Update API URL in `src/config/api.js` if backend port changes

### CORS Issues
- Backend already configured with CORS
- Ensure backend is running on port 5000
- Check API URL in frontend matches backend URL

### File Upload Issues
- Ensure `uploads/` folder exists in backend directory
- Check file size limits (max 10MB)
- Verify file types (PDF, DOC, DOCX, JPG, PNG)

---

## Notes

- OCR processing is currently simulated with sample questions
- For production, integrate actual OCR service (Tesseract, Google Vision API, etc.)
- Change JWT_SECRET in production
- Use environment-specific MongoDB URIs
- Implement rate limiting for production
- Add file storage service (AWS S3, Cloudinary) for production

---

## Demo Flow

1. Start MongoDB
2. Start backend: `cd backend-code && npm run dev`
3. Start frontend: `npm run dev` (from project root)
4. Login as admin (pranav2005@gmail.com / VP@2309)
5. Create test students and mentors
6. Create company folders (Infosys, TCS, etc.)
7. Upload files and process OCR
8. Create assessments
9. Login as student and take assessments
10. Login as mentor to view results

Enjoy your College Placement Portal!
