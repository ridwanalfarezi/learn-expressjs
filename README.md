# Express.js Learning Collection

## Project Title
**Express.js Backend Mastery**

## Objective
The primary objective of this repository is to document a comprehensive learning journey into backend development using Node.js and Express.js. By building a diverse set of applications—from simple APIs to complex systems—the goal is to master concepts such as RESTful architecture, database management (SQL & NoSQL), authentication, middleware, and system design.

## Technologies
- **Runtime:** Node.js
- **Framework:** Express.js
- **Languages:** JavaScript (ES6+), TypeScript
- **Databases:** MongoDB (Mongoose), PostgreSQL (Prisma ORM)
- **Authentication:** JWT (JSON Web Tokens), Passport.js
- **Testing:** Jest, Supertest
- **Tools:** Docker, Babel, ESLint

## Projects & Features

This repository contains several distinct projects, each focusing on specific aspects of backend development:

### 1. Comments API (`/comments-api`)
A dedicated service for managing nested comments.
- **Key Features:** CRUD operations for comments, threaded/nested replies, unit testing with Jest.

### 2. Order Processing System (`/order-processing-system`)
A system simulating backend logic for e-commerce orders.
- **Key Features:** Inventory management, payment processing simulation, order lifecycle handling.

### 3. Products API (`/products-api`)
A robust catalog service for e-commerce.
- **Key Features:** Product management, category filtering, PostgreSQL integration via Prisma.

### 4. Rent Car API (`/rent-car-api`)
A car rental booking service built with TypeScript.
- **Key Features:** Booking management, availability tracking, strong typing with TypeScript, Docker support.

### 5. Subscription Tracker API (`/subcription-tracker-api`)
An application to track and manage user subscriptions.
- **Key Features:** Email notifications (Nodemailer), recurring billing logic, Arcjet protection, MongoDB integration.

### 6. YelpClone (`/yelpclone`)
A full-stack application mimicking Yelp's core functionality.
- **Key Features:** Places/Reviews management, geo-location services, image uploads, server-side rendering with EJS.

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd express
   ```

2. **Choose a project:**
   Navigate to the specific project directory you want to run.
   ```bash
   cd products-api
   # or
   cd yelpclone
   ```

3. **Install Dependencies:**
   Install the required packages for that specific project.
   ```bash
   npm install
   ```

4. **Environment Configuration:**
   - Most projects have a `.env.example` file.
   - Create a `.env` file in the project root and copy the contents from `.env.example`.
   - Fill in your specific credentials (database URLs, API keys, etc.).

## Usage

Each project typically has standard npm scripts defined in `package.json`.

- **Development Mode:**
  ```bash
  npm run dev
  # or
  npm start
  ```

- **Run Tests (where applicable):**
  ```bash
  npm test
  ```

Check the `package.json` file in each project folder for specific commands.

## Outcomes
By completing these projects, the following skills are developed:
- Designing and implementing scalable RESTful APIs.
- Managing relational (PostgreSQL) and non-relational (MongoDB) databases.
- Implementing secure authentication and authorization flows.
- Writing clean, testable, and modular code.
- Deploying and containerizing applications using Docker.

## Contribution
Contributions are welcome! If you have suggestions for improvements or want to add a new learning module:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License
Distributed under the MIT License. See `LICENSE` for more information.
