# Comments API

## Project Title
**Comments API Service**

## Objective
To build a scalable API for handling user comments with support for nested replies, authentication, and database persistence. This project demonstrates handling recursive data structures (threaded comments) and relational data in a SQL database.

## Technologies
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (via Prisma ORM)
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **Tools:** Nodemon, Morgan (logging)

## Features
- **User Authentication:** Sign up and login with hashed passwords.
- **CRUD Operations:** Create, read, update, and delete comments.
- **Nested Comments:** Support for replying to comments (threading).
- **Author Attribution:** Comments are linked to authenticated users.

## Setup
1. **Navigate to the directory:**
   ```bash
   cd comments-api
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env` file and add your database connection string and JWT secret:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/comments_db"
   JWT_SECRET="your_super_secret_key"
   ```
4. **Database Migration:**
   ```bash
   npx prisma migrate dev --name init
   ```

## Usage
- **Start the server:**
   ```bash
   npm start
   ```
   The server will typically run on `http://localhost:3000` (check console output).

## Outcomes
- Understanding of self-referencing database models (comments replying to comments).
- Implementation of secure JWT-based authentication.
- Experience with Prisma ORM for MySQL.

## Contribution
Feel free to open issues or pull requests to improve the threading logic or add features like upvoting.

## License
ISC
