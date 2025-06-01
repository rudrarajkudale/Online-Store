# Online Store

## Description  
This is an online platform where multiple users can add and manage their stores. Users can register, submit ratings for stores, and interact with the platform based on their roles.

## Features  
- FullStack Intern Coding Challenge  
- Multi-role user management with role-based access control  
- Store rating system (ratings from 1 to 5)  
- User registration, login, and password update  
- Admin dashboard with detailed user and store listings  
- Search and filter capabilities on listings  
- Sorting on key fields like Name and Email  
- Secure form validations  
- Logout functionality for all users  

## Tech Stack  
- Backend: Express.js  
- Database: MySQL  
- Frontend: React.js  

## User Roles and Functionalities  

### 1. System Administrator  
- Add new stores, normal users, and admin users  
- Access dashboard showing:  
  - Total number of users  
  - Total number of stores  
  - Total number of submitted ratings  
- Add new users with Name, Email, Password, Address  
- View lists of stores with details: Name, Email, Address, Rating  
- View lists of normal and admin users with Name, Email, Address, Role  
- Apply filters on all listings by Name, Email, Address, and Role  
- View detailed user information including Rating for Store Owners  
- Logout from the system  

### 2. Normal User  
- Sign up and log in  
- Signup form includes Name, Email, Address, Password  
- Update password after logging in  
- View a list of all registered stores  
- Search stores by Name and Address  
- Store listings display Store Name, Address, Overall Rating, User's Submitted Rating, and option to submit or modify rating (1 to 5)  
- Logout from the system  

### 3. Store Owner  
- Log in and update password  
- Dashboard functionalities:  
  - View users who have submitted ratings for their store  
  - See the average rating of their store  
- Logout from the system  

## Form Validations  
- **Name:** Minimum 20 characters, Maximum 60 characters  
- **Address:** Maximum 400 characters  
- **Password:** 8-16 characters, must include at least one uppercase letter and one special character  
- **Email:** Must follow standard email validation rules  

## Additional Notes  
- All tables support sorting (ascending/descending) on key fields like Name and Email  
- Best practices are followed in both frontend and backend development  
- Database schema design follows best practices  

## Technologies Used  
- MySQL  
- Node.js  
- Express.js  
- React.js  

## Usage Instructions  

### Backend Setup  
1. Clone the repository  
2. Install dependencies  
3. Set up the MySQL database  
4. Configure environment variables (`backend/.env`)  
5. Start the backend server  

### Frontend Setup  
1. Navigate to the frontend folder  
2. Install dependencies  
3. Configure environment variables (`frontend/.env`)  
4. Start the development server  

## Environment Variables  

### Backend (`backend/.env`)  
DB_HOST=localhost  
DB_USER=root  
DB_PASSWORD=root  
DB_NAME=WEBSTORE  
PORT=5000  
FRONTEND_URL=http://localhost:5173  

### Frontend (`frontend/.env`)  
VITE_BACKEND_URL=http://localhost:5000  

## Default Admin Credentials  
- **Email:** rudra@gmail.com  
- **Password:** 12345678  
