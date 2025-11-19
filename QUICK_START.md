# Quick Start Guide - College Placement Portal

## 🚀 Get Started in 5 Minutes

### Step 1: Install MongoDB

**Option A: Local MongoDB**
```bash
# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# macOS (with Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows
# Download from https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string

### Step 2: Setup Backend

```bash
cd backend-code
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=my_secret_key_12345
NODE_ENV=development
```

Create uploads folder and seed admin:
```bash
mkdir uploads
npm run seed
```

Start backend:
```bash
npm run dev
```

✅ Backend running at `http://localhost:5000`

### Step 3: Setup Frontend

```bash
cd ..
npm install
npm run dev
```

✅ Frontend running at `http://localhost:5173`

### Step 4: Login

Open browser: `http://localhost:5173`

**Admin Login:**
- Email: `pranav2005@gmail.com`
- Password: `VP@2309`

---

## 📁 Project Structure

```
project/
├── backend-code/               # MongoDB + Express Backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Folder.js
│   │   ├── File.js
│   │   ├── ParsedQuestion.js
│   │   ├── Assessment.js
│   │   └── Attempt.js
│   ├── controllers/           # Business logic
│   ├── routes/                # API routes
│   ├── middleware/            # Auth middleware
│   ├── utils/                 # Utilities
│   │   └── seedAdmin.js       # Seed admin user
│   ├── uploads/               # File uploads
│   ├── .env                   # Environment variables
│   ├── server.js              # Entry point
│   └── package.json
│
├── src/                       # React Frontend
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── admin/
│   │       ├── FolderManagement.jsx
│   │       ├── UserManagement.jsx
│   │       └── AssessmentManagement.jsx
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
│   │   └── api.js             # Axios configuration
│   ├── App.jsx                # Main app with routing
│   └── main.jsx
│
├── BACKEND_SETUP.md           # Backend setup instructions
├── PROJECT_GUIDE.md           # Complete project guide
├── MONGODB_REFERENCE.md       # MongoDB code examples
└── QUICK_START.md            # This file
```

---

## 🎯 Quick Test Flow

### 1. Admin Actions

**Login as Admin:**
```
Email: pranav2005@gmail.com
Password: VP@2309
```

**Create a Student:**
1. Click "User Management" tab
2. Click "+ Add User"
3. Fill details:
   - Name: Test Student
   - Email: student@test.com
   - Password: student123
   - Role: Student
   - Roll Number: 2021CS001
4. Click "Create User"

**Create a Folder:**
1. Click "Folders & Files" tab
2. Click "+ Create Folder"
3. Fill details:
   - Folder Name: TCS Questions
   - Company Name: TCS
4. Click "Create"

**Upload File:**
1. Click on the folder
2. Click "+ Upload File"
3. Select any PDF/DOC file
4. Click "Upload"
5. Click "Process OCR" (simulates question extraction)

**Create Assessment:**
1. Click "Assessments" tab
2. Click "+ Create Assessment"
3. Fill details:
   - Title: TCS Aptitude Test
   - Company: TCS
   - Duration: 30 minutes
   - Total Marks: 10
4. Click "Create"

### 2. Student Actions

**Login as Student:**
```
Email: student@test.com
Password: student123
```

**Take Practice Test:**
1. Click on any company card (e.g., TCS)
2. Click "Start Practice"
3. Answer questions
4. Click "Submit Assessment"

**View Results:**
- Scroll to "My Attempts" section
- See your score and percentage

### 3. Mentor Actions

**Create a Mentor First (as Admin):**
```
Name: Test Mentor
Email: mentor@test.com
Password: mentor123
Role: Mentor
```

**Login as Mentor:**
```
Email: mentor@test.com
Password: mentor123
```

**Monitor Students:**
1. View all assessments
2. Click "View Attempts" on any assessment
3. See student performance

---

## 🔧 Common Commands

### Backend Commands
```bash
cd backend-code

# Install dependencies
npm install

# Seed admin user
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### MongoDB Commands
```bash
# Start MongoDB (Linux/Mac)
sudo systemctl start mongodb

# Stop MongoDB
sudo systemctl stop mongodb

# Check MongoDB status
sudo systemctl status mongodb

# Connect to MongoDB shell
mongo

# Use database
use placement_portal

# View collections
show collections

# View all users
db.users.find()
```

---

## 🎨 UI Features

### Beautiful Design Elements:
- ✨ Gradient backgrounds and cards
- 🎯 Smooth transitions and hover effects
- 📊 Color-coded role badges (Admin: Red, Mentor: Blue, Student: Green)
- ⏱️ Real-time countdown timer in assessments
- 📈 Progress indicators and statistics cards
- 🎨 Tailwind CSS utility classes
- 📱 Fully responsive design

### Color Scheme:
- Primary: Blue (#0ea5e9)
- Success: Green (#22c55e)
- Warning: Orange (#f97316)
- Danger: Red (#ef4444)
- Neutral: Gray (#6b7280)

---

## 📚 API Endpoints Quick Reference

### Auth
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Register (Admin only)
- GET `/api/auth/me` - Current user

### Folders
- POST `/api/folders` - Create folder
- GET `/api/folders` - Get all folders
- GET `/api/folders/:id` - Get folder details

### Files
- POST `/api/files/upload` - Upload file
- GET `/api/files` - Get all files
- POST `/api/files/:id/ocr` - Process OCR

### Assessments
- POST `/api/assessments` - Create assessment
- GET `/api/assessments` - Get assessments
- POST `/api/assessments/random` - Generate random test

### Attempts
- POST `/api/attempts/start` - Start assessment
- POST `/api/attempts/answer` - Submit answer
- POST `/api/attempts/submit` - Submit assessment
- GET `/api/attempts/my-attempts` - Student's attempts

---

## ⚠️ Troubleshooting

### MongoDB not connecting?
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb
```

### Backend won't start?
```bash
# Check if port 5000 is free
lsof -i :5000

# Change port in .env
PORT=5001
```

### Frontend build errors?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Cannot login?
```bash
# Re-seed admin user
cd backend-code
npm run seed
```

---

## 🎓 Next Steps

1. ✅ Complete basic setup
2. 📝 Create sample users (students, mentors)
3. 🏢 Create company folders (Infosys, TCS, Wipro, etc.)
4. 📄 Upload question papers
5. 🧪 Create practice assessments
6. 🎯 Test complete flow
7. 📊 Monitor student performance

---

## 📞 Support

For issues or questions:
1. Check PROJECT_GUIDE.md for detailed documentation
2. Check MONGODB_REFERENCE.md for database queries
3. Review error logs in terminal
4. Verify all services are running

---

**Happy Coding! 🚀**
