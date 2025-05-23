# 📖 BlogStory – A Modern Blogging Platform

Welcome to **BlogStory** – a clean, responsive blogging platform where users can write, edit, and share their stories.
Built with **React**, **CKEditor**, and modern web technologies, BlogStory is designed to offer a seamless and enjoyable writing experience.

---

## 🚀 Tech Stack

- **Frontend Framework**: React 18
- **Routing**: React Router v6
- **Rich Text Editor**: CKEditor 5
- **HTTP Client**: Axios
- **State Management**: Context API (for auth)
- **Styling**: Custom responsive CSS

---

## ✨ Features

### 🔐 Authentication
- Secure user sign-up and login
- JWT-based session management
- Persistent auth with protected routes

### 📝 Blog Management
- Rich text editor for posts (CKEditor 5)
- Create, edit, delete your own posts
- View full blog content in detail

### 🔍 Content Discovery
- Homepage feed with all published posts
- Frontend-only search by title, author, or content
- Summarized previews for faster reading

### 👤 User Dashboard
- See and manage your blog posts
- Quick access to create/edit/delete
- Post statistics with author/date info

### 🎨 User Experience
- Fully responsive design (mobile-first)
- Skeleton loaders and feedback messages
- Clean UI with accessible navigation



## 📁 Project Structure


src/
├── components/ # Navbar, route guards, reusable UI
├── context/ # AuthContext for login state
├── pages/ # Home, Login, Signup, Dashboard, Post views
├── services/ # Axios config and API calls
├── App.js # Main routing and layout
├── App.css # Global styles
└── index.js # Entry point



---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js v14+
- Backend running on `http://localhost:5000`

### Steps

```bash
# 1. Clone the repo
git clone <your-frontend-repo-url>
cd blogging-platform-frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start development server
npm start

Go to http://localhost:3000
```

##Developmenet Strategy

Component-first design using React
Centralized auth logic with Context API
API-first structure for scalable integration
Progressive enhancement (basic → rich features)


##Workflow

Plan UI and component hierarchy
Build reusable components
Connect with backend APIs
Test each user flow
Polish UI/UX with loaders, errors, validation

🔌 API Endpoints (Backend Required)

POST /api/auth/signup – Register
POST /api/auth/login – Login
GET /api/posts – List all posts
GET /api/posts/:id – View post
POST /api/posts – Create post
PUT /api/posts/:id – Edit post
DELETE /api/posts/:id – Delete post
GET /api/posts/user/my-posts – User’s posts


# Manas - manasnarkhede2210@gmail.com
