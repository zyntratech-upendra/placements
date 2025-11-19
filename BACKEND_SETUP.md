# Backend Setup Instructions

## MongoDB + Express Backend Structure

### 1. Create Backend Directory
```bash
mkdir backend
cd backend
npm init -y
```

### 2. Install Dependencies
```bash
npm install express mongoose bcryptjs jsonwebtoken cors dotenv multer axios
npm install nodemon --save-dev
```

### 3. Update package.json scripts
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### 4. Create .env file
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### 5. Directory Structure
```
backend/
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── Folder.js
│   ├── File.js
│   ├── ParsedQuestion.js
│   ├── Assessment.js
│   └── Attempt.js
├── middleware/
│   ├── auth.js
│   └── adminOnly.js
├── routes/
│   ├── auth.js
│   ├── folders.js
│   ├── files.js
│   ├── assessments.js
│   └── attempts.js
├── controllers/
│   ├── authController.js
│   ├── folderController.js
│   ├── fileController.js
│   ├── assessmentController.js
│   └── attemptController.js
├── utils/
│   └── seedAdmin.js
├── uploads/
├── .env
├── server.js
└── package.json
```

### 6. Seed Admin User
```bash
node utils/seedAdmin.js
```

This will create the admin user:
- Email: pranav2005@gmail.com
- Password: VP@2309
- Role: admin

### 7. Run Backend
```bash
npm run dev
```

Backend will run on http://localhost:5000
