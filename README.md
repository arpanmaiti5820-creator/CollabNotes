CollabNotes
A full-stack collaborative notes application built with Node.js, Express.js, MongoDB, and Vanilla JavaScript.
🌐 Live Demo
https://collabnotes-q6qq.onrender.com
✨ Features
- 🔐 User signup and login
- 🔑 JWT-based authentication
- 🔵 Google OAuth login
- 📧 Forgot password and password reset
- 📝 Create, edit, view, and delete notes
- 🌍 Public and private notes
- ❤️ Like notes with like counts
- ⭐ Favorite notes
- 🗑️ Trash and restore notes
- 📁 Create and manage folders
- 🔎 Search notes
- 📎 Image and PDF attachments
- 🔔 Notifications
- 📱 Responsive dashboard and mobile sidebar
- 👤 User profile information
- 🔒 Protected backend API routes
🛠️ Tech Stack
Frontend
- HTML5
- CSS3
- JavaScript
- DOM API
- Local Storage
Backend
- Node.js
- Express.js
- JWT
- Multer
- bcrypt
Database
- MongoDB
- Mongoose
Authentication
- JWT authentication
- Google OAuth
Email
- Brevo API
Deployment
- GitHub — source code
- Render — application hosting
- MongoDB Atlas — database
📂 Project Structure
CollabNotes/
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── reset-password.html
│   ├── style.css
│   ├── dashboard.css
│   ├── script.js
│   └── dashboard.js
├── data/
│   └── notes/folders data
├── uploads/
│   └── user attachments
├── server.js
├── package.json
├── package-lock.json
└── .gitignore
Local data and uploaded files are excluded from Git using .gitignore.

🚀 Run Locally
1. Clone the repository
git clone <your-github-repository-url>
cd CollabNotes
2. Install dependencies
npm install
3. Create .env
Create a .env file in the project root:
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
APP_URL=http://localhost:3000
BREVO_API_KEY=your_brevo_api_key
If Google OAuth is enabled in your project, also configure the Google OAuth credentials required by the application.
Never commit .env or API keys to GitHub.
4. Start the server
npm start
Open:
http://localhost:3000
🔐 Security
- Passwords are hashed using bcrypt.
- Authentication uses signed JWT tokens.
- Password reset tokens are generated securely and expire after a limited period.
- Environment variables are used for secrets.
- Sensitive files such as .env are excluded from Git.
📡 Deployment
The production application is deployed on Render.
Every new commit pushed to the configured GitHub branch can be deployed automatically by Render when auto-deploy is enabled.
⚠️ Current Storage Notes
The application currently uses MongoDB for user data while some notes/folder data and uploaded files are stored locally.
On hosting platforms with ephemeral filesystems, locally stored files can be lost after certain restarts or redeployments. For a production-scale version, these can be migrated to persistent database/object storage.
📌 Future Improvements
- Move all notes and folders to MongoDB
- Add cloud storage for attachments
- Add real-time collaboration
- Add richer note editing
- Add pagination for large note collections
- Add stronger API validation and rate limiting
- Add automated tests
- Add production monitoring and logging
👨‍💻 Author
Arpan Maiti
B.Tech Computer Science & Engineering
MCKV Institute of Engineering — MAKA