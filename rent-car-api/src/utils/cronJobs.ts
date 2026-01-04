import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

// Schedule a task to run every hour
cron.schedule("0 * * * *", async () => {
  try {
    console.log(
      `[${new Date().toISOString()}] Running rental status update cron job...`
    );

    const rents = await prisma.rental.findMany({
      include: { car: true },
    });

    await Promise.all(
      rents.map(async (rent) => {
        let status = rent.status;

        if (rent.startDate && rent.endDate) {
          if (rent.startDate <= new Date() && rent.endDate >= new Date()) {
            status = "active";
          }

          if (rent.startDate < new Date() && rent.endDate < new Date()) {
            status = "finished";

            await prisma.car.update({
              where: { id: rent.carId },
              data: { quantity: { increment: rent.quantity } },
            });
          }

          if (status !== rent.status) {
            await prisma.rental.update({
              where: { id: rent.id },
              data: { status },
            });
          }
        }
      })
    );

    console.log(
      `[${new Date().toISOString()}] Successfully updated ${
        rents.length
      } rental(s)`
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Cron job failed:`, error);
    // TODO: Send alert to monitoring service (Sentry, etc.)
  }
});
