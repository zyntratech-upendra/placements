# 🎓 College Placement Portal

A comprehensive **MERN Stack** placement management system with role-based authentication, assessment management, and beautiful UI built with React and Tailwind CSS.

![Built with](https://img.shields.io/badge/Built%20with-MERN-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![React](https://img.shields.io/badge/Frontend-React-blue)
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
- **OCR Processing**: Simulate question extraction from uploaded files
- **Assessment Creation**: Create scheduled and practice assessments
- **Performance Monitoring**: View all student attempts and analytics

### 👨‍🏫 Mentor Dashboard
- Create and manage assessments
- Monitor student performance
- View detailed attempt analytics
- Track company-wise performance
- Generate reports

### 🎓 Student Dashboard
- **Practice by Company**: Take random practice tests for any company
- **Scheduled Assessments**: Participate in scheduled exams
- **Real-time Assessment**: Timer-based tests with auto-submit
- **Results & Analytics**: View scores, percentages, and performance history
- **Progress Tracking**: Monitor improvement over time

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- npm or yarn

### Installation

**1. Clone the repository**
```bash
git clone <repository-url>
cd project
```

**2. Setup Backend**
```bash
cd backend-code
npm install
```

Create `.env` file:
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

**3. Setup Frontend**
```bash
cd ..
npm install
```

**4. Run the Application**

Terminal 1 (Backend):
```bash
cd backend-code
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

**5. Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

**6. Login Credentials**
```
Admin:
Email: pranav2005@gmail.com
Password: VP@2309
```

---

## 📁 Project Structure

```
placement-portal/
│
├── backend-code/              # Express + MongoDB Backend
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
├── src/                      # React Frontend
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── admin/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── MentorDashboard.jsx
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
    └── QUICK_START.md         # Quick start guide
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

---

## 📊 Database Schema

### Collections

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

---

## 🔑 API Endpoints

### Authentication
```
POST   /api/auth/login              Login
POST   /api/auth/register           Register new user (Admin only)
GET    /api/auth/me                 Get current user
GET    /api/auth/users              Get all users
```

### Folders
```
POST   /api/folders                 Create folder (Admin)
GET    /api/folders                 Get all folders
GET    /api/folders/:id             Get folder details
PUT    /api/folders/:id             Update folder (Admin)
DELETE /api/folders/:id             Delete folder (Admin)
```

### Files
```
POST   /api/files/upload            Upload file (Admin)
GET    /api/files                   Get all files
GET    /api/files/folder/:id        Get files by folder
POST   /api/files/:id/ocr           Process OCR (Admin)
DELETE /api/files/:id               Delete file (Admin)
```

### Assessments
```
POST   /api/assessments             Create assessment
GET    /api/assessments             Get all assessments
GET    /api/assessments/:id         Get assessment details
POST   /api/assessments/random      Generate random test
PUT    /api/assessments/:id         Update assessment
DELETE /api/assessments/:id         Delete assessment
```

### Attempts
```
POST   /api/attempts/start          Start assessment
POST   /api/attempts/answer         Submit answer
POST   /api/attempts/submit         Submit assessment
GET    /api/attempts/my-attempts    Get student's attempts
GET    /api/attempts/all            Get all attempts (Admin/Mentor)
GET    /api/attempts/:id            Get attempt details
```

---

## 🎨 UI Features

- **Beautiful Gradients**: Modern color schemes and smooth transitions
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Real-time Updates**: Live timer and progress tracking
- **Interactive Components**: Hover effects, animations, and feedback
- **Role-based UI**: Different dashboards for each user role
- **Dark Mode Ready**: Built with Tailwind's color system

### Color Palette
- Primary: Blue (#0ea5e9)
- Success: Green (#22c55e)
- Warning: Orange (#f97316)
- Danger: Red (#ef4444)

---

## 📖 Usage Guide

### For Admins

1. **Create Users**
   - Navigate to User Management
   - Add students and mentors with credentials

2. **Organize Questions**
   - Create company folders (Infosys, TCS, etc.)
   - Upload question papers
   - Process files with OCR simulation

3. **Create Assessments**
   - Select company folder
   - Set duration and marks
   - Choose assessment type (Practice/Scheduled)

4. **Monitor Performance**
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

3. **Track Progress**
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

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=your_secret_key
NODE_ENV=development
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

# Or kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### CORS Issues
- Ensure backend is running
- Check API_URL in frontend matches backend URL
- Verify CORS is enabled in backend (already configured)

---

## 📝 Future Enhancements

- [ ] Real OCR integration (Tesseract, Google Vision API)
- [ ] Email notifications for assessments
- [ ] PDF report generation
- [ ] Advanced analytics dashboard
- [ ] Video proctoring
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Automated question generation with AI
- [ ] Peer comparison and leaderboards
- [ ] Company-specific preparation roadmaps

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

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with MERN Stack | MongoDB + Express + React + Node.js**
