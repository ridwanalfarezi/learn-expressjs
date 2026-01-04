# YelpClone

## Project Title
**YelpClone (Backend & Frontend Rendering)**

## Objective
To build a full-stack application that replicates the core features of Yelp. This project focuses on server-side rendering (SSR) with EJS, managing user-generated content (reviews, places), and authorization.

## Technologies
- **Runtime:** Node.js
- **Framework:** Express.js
- **Templating:** EJS (Embedded JavaScript) with `ejs-mate`
- **Database:** SQL Database (via Prisma ORM)
- **Authentication:** Passport.js (Local Strategy)
- **Validation:** Joi
- **Session:** express-session, connect-flash

## Features
- **Places:** Create, view, edit, and delete business listings.
- **Reviews:** Users can add reviews and ratings to places.
- **Authorization:** Only authors can edit/delete their own listings/reviews.
- **Flash Messages:** UI feedback for actions (success/error).
- **Map Integration:** `hereMaps.js` utility suggests map integration.

## Setup
1. **Navigate to the directory:**
   ```bash
   cd yelpclone
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env` file.
   ```env
   DATABASE_URL="..."
   SESSION_SECRET="..."
   ```
4. **Database:**
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev
   ```
   To seed data:
   ```bash
   node ./prisma/seed.js
   ```

## Usage
- **Start the server:**
   ```bash
   npm start
   ```
   Access the application in your browser (usually `http://localhost:3000`).

## Outcomes
- Building a classic MVC (Model-View-Controller) application.
- Handling sessions and cookies for user state.
- Server-side rendering vs API-only approaches.

## Contribution
Contributions are welcome.

## License
ISC
