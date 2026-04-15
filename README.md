# Book My Ticket Backend

A production-style backend system built by extending a starter codebase.  
This project focuses on authentication, protected routes, and safe seat booking using PostgreSQL.

---

## 🚀 Features

- User registration
- User login with JWT authentication
- Protected routes using middleware
- Seat booking system using PostgreSQL
- Transaction-safe booking (prevents double booking using FOR UPDATE)
- Booking associated with authenticated users
- Clean integration with existing starter APIs

---

## 🛠 Tech Stack

- Node.js
- Express.js
- PostgreSQL (Neon DB)
- JWT (Authentication)
- bcrypt (Password hashing)

---
## 🔐 Authentication Flow

1. User registers in the system
2. User logs in with email and password
3. Server validates credentials and generates a JWT token
4. Token is sent to the client in the response
5. Client stores the token and sends it in request headers for protected routes: Authorization: Bearer <token>

6. Middleware verifies the token before allowing access to protected endpoints
7. If token is valid, request proceeds; otherwise, access is denied

---

## 🎟 Booking Flow

1. User logs in and gets authenticated
2. User fetches available seats
3. User selects a seat to book
4. Booking request is sent with authentication token
5. Server verifies user authentication via middleware
6. Database locks the selected seat using transaction (`FOR UPDATE`)
7. System checks if seat is already booked:
   - If yes → returns error (prevents duplicate booking)
   - If no → proceeds with booking
8. Seat is marked as booked and associated with the logged-in user
9. Transaction is committed successfully
