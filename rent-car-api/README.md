# Rent Car API

## Project Title
**Car Rental Booking Service**

## Objective
To develop a type-safe and reliable backend system for a car rental business. This project emphasizes the use of TypeScript for code quality, Docker for containerization, and advanced scheduling features.

## Technologies
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (via Prisma ORM), Redis (caching)
- **Authentication:** Passport.js (Google OAuth), JWT
- **Tools:** Docker, Docker Compose, Node-cron, Multer (file uploads)

## Features
- **Booking System:** specialized logic for reserving vehicles.
- **Availability Tracking:** prevent double bookings.
- **Social Login:** Google OAuth integration.
- **Image Upload:** Handling vehicle images with Multer.
- **Scheduled Tasks:** Automated jobs (e.g., booking expiry) using `node-cron`.
- **Caching:** Redis integration for performance.

## Setup
1. **Navigate to the directory:**
   ```bash
   cd rent-car-api
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env` file. Refer to `.env.example`.
   ```env
   DATABASE_URL="postgresql://..."
   REDIS_URL="redis://..."
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```
4. **Database Setup:**
   ```bash
   npx prisma migrate dev
   # Optional: Seed data
   npx prisma db seed
   ```
5. **Docker (Optional):**
   ```bash
   docker-compose up -d
   ```

## Usage
- **Development Mode:**
  ```bash
  npm run dev
  ```
- **Production Build:**
  There is no build script explicitly in `package.json` scripts seen, but `tsc` would typically be used.

## Outcomes
- Mastery of TypeScript in an Express environment.
- Understanding of containerization with Docker.
- Implementing complex business logic (bookings, time slots).

## Contribution
Contributions welcome!

## License
ISC
