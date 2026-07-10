# Restaurant Reservation Management System

A full-stack web application for managing restaurant reservations. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- A MongoDB URI (or the backend will automatically use an in-memory MongoDB instance for local testing).

### Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on port 5000.*

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open on port 5173.*

## Assumptions Made
1. **Single Restaurant Setup:** The system assumes all tables and reservations are for one specific restaurant.
2. **Table Seeding:** Tables must be created by an Admin before customers can make reservations.
3. **Roles on Registration:** For simplicity in this assignment, anyone registering through the standard login page is assigned the `customer` role. To test the `admin` role, you can change the role assignment in `authController.js` temporarily or edit the database directly. (Alternatively, the API supports sending `"role": "admin"` in the register payload if tested via Postman).
4. **Time Slots:** Fixed hourly time slots (e.g., 18:00, 19:00) were used instead of arbitrary minute-level booking, to simplify conflict management and UI selection.

## Extra Features Added (Beyond Requirements)
The following features were added to enhance the user experience beyond the original assignment documentation:
1. **Visual Table Availability Grid**: Customers can see a real-time visual grid of all tables and their available/booked time slots for the selected date.
2. **Custom Booking Durations**: Users can manually specify the duration of their reservation in hours (up to 12 hours), and the system ensures there are no overlaps for the entire duration.
3. **12-Hour Time Formatting**: All military times (e.g., 18:00) are automatically formatted to standard 12-hour AM/PM formats (e.g., 6:00 PM) for better readability.
4. **Real-Time Auto-Polling**: The application seamlessly polls the database in the background every 5 seconds, ensuring that table availability and reservations update in near real-time without requiring manual page refreshes.
5. **Seamless Auth State Management**: Logging in and out instantly updates the user interface without flashing or hard-reloading the browser.

## Explanation of Reservation and Availability Logic
When a customer attempts to book a table for a specific date, time, and number of guests:
1. **Capacity Check:** The backend queries all tables where `capacity` >= `guests`.
2. **Conflict Check:** It queries existing reservations for the selected `date` and `timeSlot`.
3. **Filtering:** It filters the list of suitable tables, removing any tables that are already booked for that exact date and time.
4. **Assignment:** If at least one table remains, the system automatically assigns the first available table to the reservation and saves it to the database. If no tables are available, a 409 Conflict error is returned gracefully to the frontend.

## Explanation of Role-Based Access (User vs Admin)
- **JSON Web Tokens (JWT):** Upon login, a JWT is generated containing the user's `id` and `role`. This token is sent in the `Authorization` header for protected routes.
- **Customer (User):** Can only view their own reservations and cancel their own reservations. The backend enforces this by matching `req.user.id` against the reservation's `user` field.
- **Administrator (Admin):** Has access to special `/admin/*` routes. The `admin` middleware checks if `req.user.role === 'admin'`. Admins can view all reservations, filter them by date, manage (add/delete) tables, and cancel any user's reservation.

## Known Limitations
1. **Hardcoded Time Slots**: The time slots (6 PM to 10 PM) are currently restricted to evening hours in the frontend.

## Areas for Improvement with Additional Time
- Implement **WebSockets (Socket.io)** to show real-time table availability on the frontend without refreshing.
- Add **Email Notifications** (via Nodemailer/SendGrid) for reservation confirmations and cancellations.
- Implement a visual **Interactive Floor Plan** for admins and customers to select specific tables visually.
- Enhance the **Admin Dashboard** with analytics (e.g., busiest hours, most popular tables).
- Add robust unit and integration testing using **Jest and Supertest**.
