# EduMange

A modern, full-stack educational administration platform designed for schools and educational institutions. Built with a robust .NET backend and a contemporary React frontend, the Student Management System provides comprehensive tools for managing students, classes, subjects, attendance, grades, and user authentication.

---

## 🎯 Overview

Its Student Management System is an enterprise-grade web application architected to streamline academic administration workflows. It combines a scalable layered backend architecture with a modern, responsive user interface powered by React 18 and Vite.

### Key Highlights

- **Modern Tech Stack**: React 18, Vite, TailwindCSS frontend with ASP.NET Core backend
- **Production Ready**: Optimized performance with React Query caching, error handling, and comprehensive state management
- **Intuitive UI**: Clean, responsive design built with TailwindCSS and modern component patterns
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Real-time Data Management**: React Query integration for efficient data synchronization and caching
- **Comprehensive Dashboard**: Visual analytics with charts and key metrics

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [API Integration](#api-integration)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Support](#support)

---

## ✨ Features

### Implemented Features

#### 🔐 **Authentication & Authorization**

- Secure login system with JWT tokens
- User credentials validation and management
- Refresh token
- Role-based access control
- Password recovery functionality
- Persistent session management with localStorage

#### 📊 **Dashboard**

- Executive summary with key metrics
- Teacher and student count visualization
- Highest attendance cards with subject breakdown
- Student performance analytics
- Visual charts using Recharts
- Real-time data updates

#### 👥 **Student Management**

- Complete CRUD operations for student records
- Student listing with advanced filtering and search
- Detailed student profiles with individual information
- Student creation and editing with form validation
- Pagination support for large datasets
- Student class assignment tracking
- Edit student modal with inline updates

#### 📚 **Classes Management**

- View and manage classes
- Class assignment to students
- Modal-based class assignment interface
- Class grid display with sorting capabilities
- Track students per class

#### 🎓 **Subjects Management**

- Subject catalog browsing
- Subject listing with comprehensive data
- Subject grid with enhanced UX
- Subject information display

#### 💻 **User Interface**

- Clean, modern design with TailwindCSS
- Responsive layout that works on desktop and tablet
- Sidebar navigation with intuitive menu structure
- Header with user information
- Error boundaries for graceful error handling
- Loading states with user-friendly spinners
- Toast notifications for user feedback
- Protected routes with unauthorized access handling

### Planned Features (Not Yet Implemented)

- Grades & Academic Performance
- Attendance Tracking
- Reports & Analytics
- User Management
- Settings & Configuration

---

## 🛠️ Tech Stack

### Frontend

| Technology          | Version | Purpose                     |
| ------------------- | ------- | --------------------------- |
| **React**           | 18.2.0  | UI framework                |
| **Vite**            | 4.5.0   | Build tool & dev server     |
| **React Router**    | 6.20.1  | Client-side routing         |
| **React Query**     | 5.8.4   | Data fetching & caching     |
| **TailwindCSS**     | 3.3.5   | Utility-first CSS framework |
| **Axios**           | 1.6.2   | HTTP client                 |
| **React Hook Form** | 7.71.1  | Form state management       |
| **SweetAlert2**     | 11.10.1 | Modal dialogs               |
| **Recharts**        | 2.8.0   | Data visualization          |
| **React Icons**     | 4.12.0  | Icon library                |
| **React Toastify**  | 9.1.3   | Notifications               |

### Backend

| Component             | Technology            | Purpose                |
| --------------------- | --------------------- | ---------------------- |
| **API**               | ASP.NET Core          | REST API endpoints     |
| **Business Layer**    | C#                    | Business logic & rules |
| **Data Access Layer** | Entity Framework Core | Database abstraction   |
| **Database**          | SQL Server            | Data persistence       |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Pages (Students, Classes, Subjects, Dashboard)      │   │
│  │  Components (Grids, Modals, Forms, Layout)          │   │
│  │  Context API & React Query for State Management    │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST API
┌──────────────────────────▼──────────────────────────────────┐
│                Backend (.NET Core)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Controllers                                    │   │
│  │  ├─ Student Controller                             │   │
│  │  ├─ Class Controller                               │   │
│  │  ├─ Subject Controller                             │   │
│  │  ├─ Auth Controller                                │   │
│  │  └─ Dashboard Controller                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Business Layer (StudentBusinessLayer)             │   │
│  │  ├─ Student Service                                │   │
│  │  ├─ Class Service                                  │   │
│  │  ├─ Subject Service                                │   │
│  │  └─ Auth Service                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Data Access Layer (StudentDataAccessLayer)        │   │
│  │  ├─ Entity Framework Core Context                 │   │
│  │  ├─ Repository Pattern Implementation             │   │
│  │  └─ Database Migrations                           │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│            SQL Server Database                              │
│  ├─ Students Table                                         │
│  ├─ Classes Table                                          │
│  ├─ Subjects Table                                         │
│  ├─ Users Table                                            │
│  └─ Related Tables                                         │
└─────────────────────────────────────────────────────────────┘
```

### Layered Architecture Benefits

- **Separation of Concerns**: Each layer has a specific responsibility
- **Maintainability**: Clear code organization and easy to navigate
- **Testability**: Components can be tested independently
- **Scalability**: New features can be added with minimal impact
- **Reusability**: Business logic can be reused across different API endpoints

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Usually comes with Node.js
- **.NET SDK** (v7.0 or higher) - [Download](https://dotnet.microsoft.com/download)
- **Visual Studio 2022** or **Visual Studio Code** - [Download](https://www.visualstudio.com/)
- **SQL Server** (2019 or higher) or **SQL Server Express** - [Download](https://www.microsoft.com/sql-server/sql-server-downloads)

### Verify Installation

```bash
# Check Node.js and npm
node --version
npm --version

# Check .NET SDK
dotnet --version

# Check SQL Server (if installed locally)
sqlcmd -S localhost -U sa -Q "SELECT @@VERSION"
```

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Student-Management-System-Project--master
```

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd StudentAPIProject

# Restore NuGet packages
dotnet restore

# Build the solution
dotnet build

# Apply database migrations (if applicable)
dotnet ef database update
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Verify installation
npm list react react-router-dom axios
```

---

## ⚙️ Configuration

### Backend Configuration

#### appsettings.json

Update your backend configuration in `StudentAPIProject/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=db;User Id=sa;Password=YourPassword;"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-here-at-least-32-characters",
    "Issuer": "StudentManagementAPI",
    "Audience": "StudentManagementApp",
    "ExpirationMinutes": 60
  }
}
```

#### appsettings.Development.json

For development environment:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  }
}
```

### Frontend Configuration

#### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=10000
```

Or use environment-specific files:

- `.env.development` - Development environment
- `.env.production` - Production environment

#### Axios Configuration

The API client is configured in `frontend/src/config/` with automatic timeout and error handling.

---

## ▶️ Running the Application

### Backend

```bash
# Navigate to backend project
cd StudentAPIProject

# Run with debug mode
dotnet run

# Or specify configuration
dotnet run --configuration Development

# The API will be available at: http://localhost:5000
# API documentation (Swagger): http://localhost:5000/swagger
```

### Frontend

```bash
# Navigate to frontend directory
cd frontend

# Development mode (with hot reload)
npm run dev

# The app will be available at: http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Access the Application

Once both backend and frontend are running:

1. Open your browser
2. Navigate to `http://localhost:5173`
3. Login with your credentials
4. Start using the application

---

## 📂 Project Structure

```
Student-Management-System-Project--master/
│
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── classes/              # Class management components
│   │   │   ├── dashboard/            # Dashboard components
│   │   │   ├── students/             # Student components
│   │   │   ├── subjects/             # Subject components
│   │   │   ├── common/               # Reusable components
│   │   │   └── layout/               # Navigation and layout
│   │   ├── pages/
│   │   │   ├── auth/                 # Login, forgot password
│   │   │   ├── dashboard/            # Dashboard page
│   │   │   ├── students/             # Student management pages
│   │   │   ├── classes/              # Class management pages
│   │   │   ├── subjects/             # Subject pages
│   │   │   ├── error/                # Error pages
│   │   │   └── settings/             # User settings
│   │   ├── contexts/                 # React Context API
│   │   │   ├── AuthContext.jsx       # Authentication context
│   │   │   ├── AppContext.jsx        # Global app state
│   │   │   └── StudentContext.jsx    # Student data context
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── config/                   # Configuration files
│   │   ├── loaders/                  # React Router loaders
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── eslintrc.json
│
├── StudentAPIProject/                # ASP.NET Core API
│   ├── Controllers/
│   │   ├── StudentController.cs
│   │   ├── ClassController.cs
│   │   ├── SubjectController.cs
│   │   ├── AuthController.cs
│   │   └── DashboardController.cs
│   ├── Middlewares/                  # Custom middlewares
│   ├── Configuration/                # API configuration
│   ├── Program.cs                    # Startup configuration
│   └── appsettings.json              # API settings
│
├── StudentBusinessLayer/             # Business logic
│   └── Services/
│       ├── StudentService.cs
│       ├── ClassService.cs
│       ├── SubjectService.cs
│       └── AuthService.cs
│
├── StudentDataAccessLayer/           # Data access
│   ├── DbContext/
│   ├── Repositories/
│   └── Entities/
│
└── Student-Management-System-Project.sln
```

---

## 🎯 Core Features

### Authentication System

**Location**: `frontend/src/contexts/AuthContext.jsx` | `frontend/src/pages/auth/`

The authentication system provides:

- User login with email and password
- JWT token storage and management
- Protected routes with automatic redirection
- Session persistence
- Logout functionality

**Usage Example**:

```javascript
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return <button onClick={logout}>Logout</button>;
}
```

### Student Management

**Location**: `frontend/src/pages/students/` | `frontend/src/components/students/`

Comprehensive student management with:

- List all students with pagination
- Create new student records
- Edit existing student information
- View detailed student profiles
- Filter and search functionality
- Real-time validation

**Key Components**:

- `StudentsPage`: Main page for viewing all students
- `StudentsGrid`: Reusable grid component with pagination
- `CreateStudent`: Form for adding new students
- `EditStudent`: Form for updating student information
- `StudentDetails`: Detailed view of a single student

### Classes Management

**Location**: `frontend/src/pages/classes/` | `frontend/src/components/classes/`

Class administration features:

- View all classes
- Assign classes to students
- Track student enrollment
- Modal-based assignment interface
- Class information display

**Key Components**:

- `ClassesPage`: Main classes page
- `ClassesGrid`: Displays all classes
- `AssignClassModal`: Modal for class assignment

### Subjects Management

**Location**: `frontend/src/pages/subjects/` | `frontend/src/components/subjects/`

Subject catalog management:

- Browse all available subjects
- Subject information display
- Grid-based interface
- Subject listing with details

**Key Components**:

- `SubjectsPage`: Main subjects page
- `SubjectsGrid`: Displays all subjects

### Dashboard Analytics

**Location**: `frontend/src/pages/dashboard/` | `frontend/src/components/dashboard/`

Comprehensive analytics dashboard featuring:

- **Student Count Widget**: Total active students
- **Teacher Count Widget**: Total active teachers
- **Highest Attendance Card**: Top-performing students
- **Highest Average Card**: Best academic performers
- **Interactive Charts**: Visual data representation using Recharts

**Key Components**:

- `DashboardPage`: Main dashboard layout
- `TeacherStudentCountDashboard`: Count widgets
- `HighestAttendanceCard`: Attendance analytics
- `HighestAverageCard`: Grade analytics

### State Management

**React Query Integration**:

- Efficient data fetching and caching
- Automatic cache invalidation
- Query result deduplication
- Built-in error handling and retry logic

**Context API**:

- `AuthContext`: Authentication state
- `AppContext`: Global application state
- `StudentContext`: Student-related data

---

## 🔌 API Integration

### Base Configuration

**Location**: `frontend/src/config/queryClient.js`

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
    },
  },
});
```

### API Endpoints (Backend)

#### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password recovery

#### Students

- `GET /api/students` - List all students
- `GET /api/students/{id}` - Get student details
- `POST /api/students` - Create new student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

#### Classes

- `GET /api/classes` - List all classes
- `GET /api/classes/{id}` - Get class details

#### Subjects

- `GET /api/subjects` - List all subjects
- `GET /api/subjects/{id}` - Get subject details

#### Dashboard

- `GET /api/dashboard` - Get dashboard metrics

### Error Handling

The application includes comprehensive error handling:

- **Route Error Boundary**: Catches routing errors
- **API Error Handler**: Handles HTTP errors
- **Toast Notifications**: User-friendly error messages
- **Graceful Degradation**: Fallback UI for errors

---

## 💻 Development

### Code Style & Linting

```bash
# Run ESLint
npm run lint

# Format code (if prettier is configured)
npm run format
```

### Development Best Practices

1. **Component Structure**
   - Keep components small and focused
   - Use custom hooks for reusable logic
   - Implement error boundaries

2. **State Management**
   - Use React Query for server state
   - Use Context API for global state
   - Keep component state minimal

3. **Performance Optimization**
   - Implement lazy loading for routes
   - Use React.memo for expensive components
   - Monitor bundle size with Vite visualization

4. **Type Safety**
   - Use PropTypes or TypeScript where applicable
   - Add JSDoc comments for complex functions

5. **Testing**
   - Write unit tests for utilities
   - Test components in isolation
   - Use integration tests for critical flows

### Hot Module Replacement (HMR)

During development, Vite provides instant updates:

```bash
npm run dev
# Make changes to your code
# Browser automatically refreshes with your changes
```

---

## 🚀 Deployment

### Frontend Deployment

#### Build Optimization

```bash
# Create production build
npm run build

# The output will be in the 'dist' directory
# Files are optimized for production
```

#### Deployment Options

- **Vercel**: `vercel deploy`
- **Netlify**: Connect GitHub repository
- **GitHub Pages**: Configure vite.config.js
- **Traditional Hosting**: Upload `dist` folder to server
- **Docker**: Containerize with Docker

#### Environment Configuration

```bash
# Build with production environment
VITE_API_URL=https://api.yourdomain.com npm run build
```

### Backend Deployment

#### Publish Application

```bash
# Publish for release
dotnet publish -c Release -o ./publish

# The published files are in the 'publish' directory
```

#### Deployment Options

- **Azure App Service**: Deploy directly from Visual Studio
- **Docker**: Containerize the API
- **IIS**: Host on Windows IIS Server
- **Linux Server**: Use Kestrel with reverse proxy (Nginx/Apache)

#### Production Checklist

- [ ] Update connection strings for production database
- [ ] Set strong JWT secret key (32+ characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up logging and monitoring
- [ ] Enable rate limiting
- [ ] Configure backup strategy
- [ ] Test authentication flow
- [ ] Verify API endpoints
- [ ] Performance testing

---

## 🤝 Contributing

We welcome contributions from the community. To contribute:

1. **Fork the Repository**

   ```bash
   git clone <your-fork-url>
   ```

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Write clear, concise code
   - Follow project conventions
   - Add comments where necessary
   - Test your changes thoroughly

4. **Commit Your Changes**

   ```bash
   git commit -m "brief description of changes"
   ```

5. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide detailed description
   - Reference any related issues
   - Include testing details

### Contribution Guidelines

- Follow the existing code style and patterns
- Write meaningful commit messages
- Keep pull requests focused and manageable
- Test your code before submitting
- Update documentation as needed
- Be respectful and constructive

---

## 🐛 Troubleshooting

### Frontend Issues

**Issue**: Port 5173 already in use

```bash
# Use a different port
npm run dev -- --port 3000
```

**Issue**: API connection errors

- Verify backend is running on correct port
- Check `VITE_API_URL` in environment variables
- Ensure CORS is enabled on backend

**Issue**: Dependencies installation fails

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

**Issue**: Database connection failure

- Verify SQL Server is running
- Check connection string in appsettings.json
- Verify database exists or run migrations

**Issue**: Port 5000 already in use

```bash
# Use a different port
dotnet run --urls http://localhost:5001
```

**Issue**: NuGet package restore fails

```bash
# Clear NuGet cache
dotnet nuget locals all --clear
dotnet restore
```

---

## 📞 Support

### Getting Help

- **Issues**: Report bugs on GitHub Issues
- **Documentation**: Check the project wiki
- **Email**: Contact the development team

### Useful Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [ASP.NET Core Documentation](https://docs.microsoft.com/dotnet/core)
- [React Query Documentation](https://tanstack.com/query/latest)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎓 About

**EduMange** was built with the purpose of providing educational institutions with a modern, reliable platform for managing their academic operations efficiently.

### Core Values

- **Reliability**: Built on proven, production-tested technologies
- **Usability**: Intuitive interface designed for end-users
- **Scalability**: Layered architecture supports growth
- **Security**: JWT authentication and secure data handling
- **Performance**: Optimized with caching and efficient APIs

---

## 📊 Project Status

- ✅ **Authentication & Authorization** - Complete
- ✅ **Dashboard** - Complete
- ✅ **Student Management** - Complete
- ✅ **Class Management** - Complete
- ✅ **Subject Management** - Complete
- 🔄 **Grades Management** - In Development
- 🔄 **Attendance System** - In Development
- 🔄 **Reports Module** - In Development
- 🔄 **User Management** - In Development
- 🔄 **Advanced Analytics** - Planned

---

## 👥 Authors & Contributors

- **Development** - Core architecture and implementation
- **Contributors** - Community improvements and bug fixes

---

**Status:** Production-ready | **Version:** 1.0.0 | **License:** MIT

**Last Updated**: March 2026 | **Version**: 1.0.0

For the latest updates and information, visit the project repository or documentation site.

---

**Made with ❤️ by the EduMange**
