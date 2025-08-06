# Teacher Prep Assistant

A comprehensive web application designed to help teachers streamline their preparation process, manage resources, track student progress, and leverage AI assistance for educational content creation. This all-in-one platform aims to reduce administrative burden and enhance teaching effectiveness through intuitive tools and intelligent recommendations.

## Technology Stack

### Frontend
- React with TypeScript for type-safe component development
- Material UI for responsive and accessible component styling
- Context API for efficient state management across components
- Framer Motion for smooth animations and transitions
- date-fns for date manipulation and formatting

### Backend
- Node.js with Express for a robust API framework
- TypeScript for type safety and improved developer experience
- MongoDB with Mongoose ODM for flexible data modeling
- JWT for secure authentication and authorization
- bcrypt.js for password hashing and security

## Features

### User Authentication
- Secure login and registration with email/password
- JWT-based authentication with token persistence
- Role-based access control (teacher/admin)
- Password hashing with bcrypt.js for enhanced security

### Dashboard
- Comprehensive overview of upcoming lessons and assignments
- Quick access to recent resources and activities
- Activity tracking with detailed statistics (lessons created, assignments graded, etc.)
- Weekly progress visualization
- Personalized recommendations based on teaching patterns

### Lesson Planner
- Create and manage detailed lesson plans with structured templates
- AI-assisted lesson plan generation based on subject, grade level, and topic
- Customizable objectives, materials, procedures, and assessment methods
- Differentiation strategies for diverse learning needs
- Subject and grade level organization with advanced filtering

### Resource Library
- Upload and organize teaching materials with metadata
- Advanced search and filtering by subject, grade level, and file type
- Collections and favorites for quick access to frequently used resources
- File preview and sharing capabilities
- AI-powered resource recommendations based on lesson content

### Grading Assistant
- Track student assignments with detailed grading interfaces
- Automated grading suggestions for objective assessments
- Customizable feedback templates for common responses
- Individual and class-wide progress reporting
- Grade distribution analytics and insights

### Calendar View
- Multiple view options (month, week, list) for schedule visualization
- Color-coded event categorization (assessments, meetings, deadlines, lessons)
- Reminder settings and notification management
- Drag-and-drop event scheduling and rescheduling
- Integration with lesson plans and assignments

### Assessment Generator
- AI-powered creation of various assessment types (quizzes, tests, rubrics)
- Multiple question formats (multiple-choice, short-answer, essay, true-false)
- Grade level appropriate content generation
- Customizable difficulty levels and learning objectives
- Export options for digital or print distribution

### Resource Recommender
- AI-driven suggestions for supplementary teaching materials
- Recommendations based on lesson content, grade level, and subject
- Filtering options for resource types and sources
- Integration with the resource library for seamless access
- Favoriting system for preferred recommendations

## Setup & Installation

### Prerequisites
- Node.js (v14.x or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Environment Setup
1. Clone the repository
```bash
git clone https://github.com/Krishna199399/teacher-prep-assistant.git
cd teacher-prep-assistant
```

2. Create environment variables
   - Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend Setup
```bash
# Navigate to project directory
cd teacher-prep-assistant

# Install dependencies
npm install

# Start development server
npm start
```
The frontend will be available at http://localhost:3000

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start development server
npm start
```
The API will be available at http://localhost:5000

### Running Both Simultaneously
You can use a tool like concurrently to run both frontend and backend:

```bash
# Install concurrently (if not already installed)
npm install -g concurrently

# Run both servers
concurrently "npm run start" "cd server && npm run start"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/me` - Get current user profile

### Lesson Plans
- `GET /api/lesson-plans` - Get all lesson plans for the user
- `GET /api/lesson-plans/:id` - Get specific lesson plan by ID
- `POST /api/lesson-plans` - Create a new lesson plan
- `PUT /api/lesson-plans/:id` - Update a lesson plan
- `DELETE /api/lesson-plans/:id` - Delete a lesson plan

### Resources
- `GET /api/resources` - Get all resources for the user
- `GET /api/resources/:id` - Get specific resource by ID
- `POST /api/resources` - Create a new resource
- `PUT /api/resources/:id` - Update a resource
- `DELETE /api/resources/:id` - Delete a resource

### Assignments
- `GET /api/assignments` - Get all assignments for the user
- `GET /api/assignments/:id` - Get specific assignment by ID
- `POST /api/assignments` - Create a new assignment
- `PUT /api/assignments/:id` - Update an assignment
- `DELETE /api/assignments/:id` - Delete an assignment

### Calendar
- `GET /api/calendar` - Get all calendar events for the user
- `GET /api/calendar/:id` - Get specific calendar event by ID
- `POST /api/calendar` - Create a new calendar event
- `PUT /api/calendar/:id` - Update a calendar event
- `DELETE /api/calendar/:id` - Delete a calendar event

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics for the user
- `PUT /api/dashboard/sync` - Sync dashboard statistics

### AI Features
- `POST /api/ai/generate-lesson` - Generate a lesson plan using AI
- `POST /api/ai/generate-assessment` - Generate an assessment using AI
- `POST /api/ai/generate-feedback` - Generate feedback for student work using AI
- `POST /api/ai/recommend-resources` - Get AI-recommended resources

## Future Enhancements
- Integration with popular Learning Management Systems (LMS) like Canvas, Google Classroom, and Schoology
- Mobile app version for on-the-go access
- Collaborative planning features for team teaching
- Advanced analytics dashboard with student performance insights
- Offline mode for working without internet connection
- Integration with video conferencing tools for virtual teaching
- Expanded AI capabilities for personalized learning path generation
- Parent communication portal

## Data Models

### User
- Authentication and profile information
- Role-based access control (teacher/admin)

### LessonPlan
- Detailed structure for lesson planning
- Includes objectives, materials, procedures, assessment methods, and differentiation strategies

### Resource
- Educational materials organization
- Categorized by subject, grade level, and type

### Assignment
- Student assessment tracking
- Includes grading and feedback functionality

### CalendarEvent
- Schedule management for various event types
- Includes assessments, meetings, deadlines, and lessons

### DashboardStat
- Performance metrics tracking
- Aggregates data for the dashboard view

## Getting Started

To run the complete application:

```bash
# Start both frontend and backend servers
node start-app.js
```

Or visit the deployed application at [your-deployment-url.com](https://your-deployment-url.com)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.