import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { geometry } from "../utils/hereMaps.js";

const prisma = new PrismaClient();

const places = [
  {
    title: "Taman Mini Indonesia Indah",
    price: 20000,
    description:
      "Taman hiburan keluarga dengan berbagai replika bangunan dari seluruh Indonesia",
    location: "Taman Mini Indonesia Indah, Jakarta",
    images: [
      {
        url: "public\\images\\image-1737378150042-297994031.png",
        filename: "image-1737378150042-297994031.png",
      },
    ],
  },
  {
    title: "Pantai Kuta",
    price: 0,
    description:
      "Pantai yang terkenal di Bali dengan pemandangan sunset yang indah",
    location: "Pantai Kuta, Kuta, Badung Regency, Bali",
    images: [
      {
        url: "public\\images\\image-1737378150042-297994031.png",
        filename: "image-1737378150042-297994031.png",
      },
    ],
  },
  {
    title: "Borobudur",
    price: 0,
    description:
      "Candi Buddha terbesar di dunia yang terletak di Magelang, Jawa Tengah",
    location: "Borobudur, Magelang, Central Java",
    images: [
      {
        url: "public\\images\\image-1737378150042-297994031.png",
        filename: "image-1737378150042-297994031.png",
      },
    ],
  },
  {
    title: "Kawah Putih",
    price: 0,
    description:
      "Kawah vulkanik dengan danau berwarna putih di Bandung, Jawa Barat",
    location: "Kawah Putih, Ciwidey, West Java",
    images: [
      {
        url: "public\\images\\image-1737378150042-297994031.png",
        filename: "image-1737378150042-297994031.png",
      },
    ],
  },
  {
    title: "Malioboro",
    price: 0,
    description:
      "Jalan utama di Yogyakarta dengan berbagai toko dan kuliner khas",
    location: "Jl. Malioboro, Yogyakarta City, Special Region of Yogyakarta",
    images: [
      {
        url: "public\\images\\image-1737378150042-297994031.png",
        filename: "image-1737378150042-297994031.png",
      },
    ],
  },
  {
    title: "Pantai Tanjung Aan",
    price: 10000,
    description:
      "Pantai dengan pasir berwarna putih dan air laut yang jernih di Lombok, Nusa Tenggara Barat",
    location: "Pantai Tanjung Aan, Lombok, West Nusa Tenggara",
    images: [
      {
        url: "public\\images\\image-1737378150042-297994031.png",
        filename: "image-1737378150042-297994031.png",
      },
    ],
  },
];

async function main() {
  try {
    console.log("Menghapus data sebelumnya...");
    await prisma.place.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("Menambahkan data baru...");
    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        username: "johndoe",
        email: "Y8o0C@example.com",
        password: await bcrypt.hash("password", 10),
      },
    });

    for (const place of places) {
      const geoData = await geometry(place.location);
      await prisma.place.create({
        data: {
          ...place,
          authorId: user.id,
          geometry: geoData,
          images: {
            create: place.images,
          },
        },
      });
    }

    console.log("Selesai seeding...");
  } catch (e) {
    console.error("Error saat melakukan seeding:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
