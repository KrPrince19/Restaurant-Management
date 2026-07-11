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
1. **Single Restaurant Context:** The application assumes all tables, reservations, and logic apply to a single restaurant location.
2. **Table Seeding by Admins:** Tables do not exist by default. An admin must create tables with specific capacities before any customer can book a reservation.
3. **Role Assignment on Registration:** For the purpose of this assignment, anyone registering through the standard login page is automatically assigned the `customer` role. To test `admin` capabilities, one can either modify the role assignment in `authController.js` temporarily, edit the user document in the database, or send `"role": "admin"` in the register payload via API testing tools like Postman.
4. **Hourly Increments for Bookings:** Time slots are fixed on an hourly basis (e.g., 18:00, 19:00). Arbitrary minute-level bookings (like 18:15) are not supported to simplify conflict management and grid-based UI selection.

## Explanation of Reservation and Availability Logic
When a customer interacts with the booking interface, the system performs several layers of logic to ensure valid bookings:
1. **Frontend Availability Grid:** Based on the selected date, guest count, and desired duration, the frontend fetches all tables and all reservations for that date. 
2. **Capacity Filtering:** The UI immediately filters out any tables where `capacity` is strictly less than the selected number of `guests`.
3. **Conflict Checking (Frontend & Backend):** 
   - Both the frontend and backend calculate if a requested booking overlaps with an existing reservation. 
   - Since custom durations are supported (e.g., a 2-hour booking starting at 18:00 covers both 18:00 and 19:00 slots), the system translates all reservations into an array of blocked hourly slots.
   - If *any* hour within the requested duration matches a blocked slot for the selected table, the booking is denied.
4. **Specific Table Selection:** Unlike systems that auto-assign a table blindly, this system presents the available tables in a visual grid, allowing customers to manually choose a specific table based on the time slot they want. When they click "Available", the `tableId` is sent to the backend.
5. **Backend Verification:** The backend re-verifies table capacity and re-checks for overlaps across the entire requested duration to prevent race conditions before saving the reservation to the database.

## Explanation of Role-Based Access (User vs Admin)
The application enforces strict role-based access control (RBAC) utilizing JSON Web Tokens (JWT) and Express middleware.

- **Authentication via JWT:** Upon successful login, a JWT is generated. This token contains the user's `id` and `role`. It is sent in the `Authorization` header (`Bearer <token>`) for all protected routes.
- **Customer (User) Access:** 
  - Regulated by the `protect` middleware, which verifies the JWT signature.
  - Customers can only view their own reservations.
  - When cancelling or editing a reservation, the backend verifies that `reservation.user.toString() === req.user.id`. A customer attempting to modify another user's reservation receives a 403 Forbidden error.
- **Administrator (Admin) Access:** 
  - Regulated by an additional `admin` middleware that strictly checks if `req.user.role === 'admin'`.
  - Admins have access to exclusive routes (e.g., viewing all reservations across the system, filtering them by date, and managing tables).
  - Admins bypass ownership checks. The cancellation logic explicitly allows an admin to cancel *any* user's reservation (`req.user.role === 'admin'`).

## Known Limitations
1. **Hardcoded Evening Time Slots:** The frontend grid currently hardcodes available hours from 18:00 (6:00 PM) to 22:00 (10:00 PM). It does not dynamically adapt to a restaurant's specific opening and closing hours.
2. **No WebSockets for Real-Time State:** The application currently relies on a 5-second interval polling mechanism to keep the frontend availability grid updated. While functional, it is not a true real-time push mechanism like WebSockets.
3. **No Email Notifications:** The system does not currently send automated confirmation or cancellation emails to users.

## Areas for Improvement with Additional Time
- **Implement Socket.io:** Replace the frontend auto-polling with WebSockets to instantly push table availability changes to all connected clients without HTTP overhead.
- **Dynamic Restaurant Settings:** Allow admins to configure opening hours, closing hours, and closed days, which the frontend would use to dynamically generate the time slot grid.
- **Visual Interactive Floor Plan:** Upgrade the table grid to a visual, drag-and-drop floor plan where customers can select tables based on their physical location (e.g., "by the window").
- **Email/SMS Integrations:** Integrate NodeMailer, SendGrid, or Twilio to dispatch reservation confirmations, reminders, and cancellation notices.
- **Comprehensive Testing:** Add robust unit and integration testing using Jest and Supertest for backend routes, and React Testing Library for frontend components.
- **Admin Analytics Dashboard:** Enhance the Admin view with charts showing peak booking hours, table utilization rates, and daily revenue estimates.
