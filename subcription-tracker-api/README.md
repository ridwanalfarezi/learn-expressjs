# Subscription Tracker API

## Project Title
**Subscription Management API**

## Objective
To build a system that helps users track their recurring subscriptions. This project introduces logic for time-based events, email notifications, and integration with modern tools like Arcjet and Upstash.

## Technologies
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT, bcryptjs
- **Notifications:** Nodemailer (Email)
- **Workflow/Queue:** Upstash Workflow
- **Security:** Arcjet (Protection/Rate limiting)
- **Tools:** ESLint, Day.js

## Features
- **Subscription Tracking:** CRUD for user subscriptions with renewal dates.
- **Email Alerts:** Automated reminders for upcoming payments.
- **Workflow Management:** Handling background jobs using Upstash.
- **Security:** Enhanced protection with Arcjet middleware.
- **Validation:** Strict data validation.

## Setup
1. **Navigate to the directory:**
   ```bash
   cd subcription-tracker-api
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env` file based on `.env.example`.
   ```env
   DB_URI="mongodb://..."
   ARCJET_KEY="..."
   UPSTASH_REDIS_REST_URL="..."
   ```
4. **Database:**
   Ensure your MongoDB instance is running or connected.

## Usage
- **Development Mode:**
  ```bash
  npm run dev
  ```
- **Start:**
  ```bash
  npm start
  ```

## Outcomes
- Working with NoSQL databases (MongoDB).
- Implementing background workflows and email services.
- Using third-party security and infrastructure tools.

## Contribution
Open for contributions.

## License
ISC (implied from package structure, verify in `package.json` if available)
