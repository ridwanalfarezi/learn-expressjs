import { Car, PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

const users: Omit<User, "id" | "token" | "createdAt" | "updatedAt">[] = [
  {
    name: "Ridwan User",
    email: "donnysutiandy@gmail.com",
    role: "customer",
  },
  {
    name: "Ridwan Admin",
    email: "alfareziridwan@gmail.com",
    role: "admin",
  },
  {
    name: "User 1",
    email: "user1@example.com",
    role: "customer",
  },
  {
    name: "User 2",
    email: "user2@example.com",
    role: "customer",
  },
  {
    name: "User 3",
    email: "user3@example.com",
    role: "customer",
  },
  {
    name: "User 4",
    email: "user4@example.com",
    role: "customer",
  },
  {
    name: "User 5",
    email: "user5@example.com",
    role: "customer",
  },
  {
    name: "User 6",
    email: "user6@example.com",
    role: "customer",
  },
  {
    name: "User 7",
    email: "user7@example.com",
    role: "customer",
  },
  {
    name: "User 8",
    email: "user8@example.com",
    role: "customer",
  },
  {
    name: "User 9",
    email: "user9@example.com",
    role: "customer",
  },
  {
    name: "User 10",
    email: "user10@example.com",
    role: "customer",
  },
  {
    name: "User 11",
    email: "user11@example.com",
    role: "customer",
  },
  {
    name: "User 12",
    email: "user12@example.com",
    role: "customer",
  },
  {
    name: "User 13",
    email: "user13@example.com",
    role: "customer",
  },
  {
    name: "User 14",
    email: "user14@example.com",
    role: "customer",
  },
  {
    name: "User 15",
    email: "user15@example.com",
    role: "customer",
  },
  {
    name: "User 16",
    email: "user16@example.com",
    role: "customer",
  },
  {
    name: "User 17",
    email: "user17@example.com",
    role: "customer",
  },
  {
    name: "User 18",
    email: "user18@example.com",
    role: "customer",
  },
];

const cars: Omit<Car, "id" | "createdAt" | "updatedAt" | "image">[] = [
  {
    name: "Car 1",
    brand: "Toyota",
    price: 1000,
    quantity: 10,
  },
  {
    name: "Car 2",
    brand: "Honda",
    price: 2000,
    quantity: 5,
  },
  {
    name: "Car 3",
    brand: "Ford",
    price: 3000,
    quantity: 3,
  },
  {
    name: "Car 4",
    brand: "Chevrolet",
    price: 4000,
    quantity: 2,
  },
  {
    name: "Car 5",
    brand: "Nissan",
    price: 5000,
    quantity: 1,
  },
];

async function main() {
  try {
    console.log("Deleting all data...");
    Promise.all([
      prisma.user.deleteMany(),
      prisma.car.deleteMany(),
      prisma.rental.deleteMany(),
    ]);

    console.log("Seeding data...");

    Promise.all([
      prisma.user.createMany({ data: users }),
      prisma.car.createMany({ data: cars }),
    ]);

    console.log("Data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
