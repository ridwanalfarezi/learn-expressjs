# Products API

## Project Title
**E-commerce Products API**

## Objective
To create a robust backend service for managing a product catalog, focusing on categorization, filtering, and efficient data retrieval using PostgreSQL and Prisma.

## Technologies
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** JWT, bcrypt
- **Security:** CORS
- **Tools:** Dotenv

## Features
- **Product Management:** Add, update, delete, and view products.
- **Categorization:** Organize products into categories.
- **Secure Access:** Authentication middleware to protect administrative routes.
- **Seeding:** Scripts to populate the database with initial category data.

## Setup
1. **Navigate to the directory:**
   ```bash
   cd products-api
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env` file based on `.env.example` (if available) or add:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/products_db"
   JWT_SECRET="your_secret_key"
   ```
4. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

## Usage
- **Start the server:**
   ```bash
   npm start
   ```
   This command runs the Prisma generation and starts the server using `node index.js`.

## Outcomes
- Proficiency in modeling e-commerce data (Products, Categories).
- Experience with PostgreSQL and relational data constraints.
- building secure API endpoints.

## Contribution
Contributions are welcome, especially for adding features like product search or image upload integration.

## License
ISC
