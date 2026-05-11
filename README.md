# Project Management System (PMS)

A full-stack web application designed for teams to manage projects, tasks, and track overall progress. Built with a modern, responsive user interface and a robust backend.

Live at https://project-management-system-rho-sandy.vercel.app/

## Features

### Authentication & Authorization
* **Role-Based Access Control (RBAC):** Supports different user roles (e.g., Admin, Manager, User).
* **JWT Authentication:** Secure login and session management using JSON Web Tokens.
* **Profile Management:** Users can view and update their profile details and passwords.

### Dashboard & Analytics
* **Overview:** Quick statistics on total projects, tasks, team members, and overdue tasks.
* **Visualizations:** Charts (using Chart.js) representing project status distribution and task progress.
* **Quick Access:** Lists of recently updated projects and overdue tasks for immediate attention.

### Project & Task Management
* **Projects:** Create, read, update, and delete projects. Track deadlines and overall status (Not Started, In Progress, Completed).
* **Tasks:** Create tasks within projects, assign them to team members, set deadlines, and manage priorities.
* **Kanban Board:** Intuitive drag-and-drop interface (using `@hello-pangea/dnd`) for managing task states (To-do, In Progress, Done).
* **Task Details:** Detailed view for individual tasks with support for comments and file attachments.

## Technology Stack

**Frontend:**
* React 18
* Vite
* Tailwind CSS (for styling and responsive design)
* React Router DOM (for navigation)
* Chart.js & react-chartjs-2 (for data visualization)
* Lucide React (for icons)
* Axios (for API requests)

**Backend:**
* Node.js
* Express.js
* MongoDB (with Mongoose)
* JSON Web Token (jsonwebtoken)
* Socket.io (for real-time updates - foundational setup)

## Getting Started

### Prerequisites
* Node.js (v16 or higher)
* MongoDB (running locally or via MongoDB Atlas)

### Installation

1. **Clone the repository (or download the source code):**
   ```bash
   # Navigate to the project root directory
   cd pms
   ```

2. **Install all dependencies:**
   There is a convenient script to install dependencies for the root, server, and client all at once.
   ```bash
   npm run install-all
   ```
   *(Alternatively, run `npm install` in the root, `client`, and `server` folders separately).*

### Configuration

1. **Backend Environment Variables:**
   Create a `.env` file in the `server` directory (`server/.env`) and add the following:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/pms
   JWT_SECRET=your_super_secret_jwt_key
   ```
   *Note: If port 5000 is in use, the server will default to 5001 or you can change it here. Ensure the frontend proxy matches.*

2. **Frontend Environment:**
   The frontend is configured to proxy API requests to `http://localhost:5001` (or whichever port your backend is using). This can be adjusted in `client/vite.config.js` if necessary.

### Running the Application

You can start both the frontend and backend simultaneously using concurrently from the root directory:

```bash
npm run dev
```

This will launch:
* **Backend Server:** `http://localhost:5001` (or 5000 depending on availability)
* **Frontend Application:** `http://localhost:3000`

### Accessing the App
Open your web browser and navigate to `http://localhost:3000`. You will be greeted by the login/registration screen to get started.

## Project Structure

```
pms/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Sidebar, Badges, etc.)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── pages/          # Main application views (Dashboard, Projects, Tasks, Profile)
│   │   ├── services/       # Axios API integration
│   │   ├── index.css       # Tailwind entry point and custom global styles
│   │   └── main.jsx        # React application entry point
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── vite.config.js      # Vite configuration & API proxy setup
├── server/                 # Node.js Backend (Express)
│   ├── config/             # Database connection setup
│   ├── controllers/        # Route logic and business rules
│   ├── middleware/         # Custom middleware (JWT auth validation)
│   ├── models/             # Mongoose schemas (User, Project, Task)
│   ├── routes/             # Express API routes
│   └── server.js           # Express app setup and server entry point
└── package.json            # Root configuration and concurrent start scripts
```
