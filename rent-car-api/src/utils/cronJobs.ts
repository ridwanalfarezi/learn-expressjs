import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Schedule a task to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running a task every hour to update rental statuses');

  const rents = await prisma.rental.findMany({
    include: { car: true },
  });

  await Promise.all(
    rents.map(async (rent) => {
      let status = rent.status;

      if (rent.startDate && rent.endDate) {
        if (rent.startDate <= new Date() && rent.endDate >= new Date()) {
          status = 'active';
        }

        if (rent.startDate < new Date() && rent.endDate < new Date()) {
          status = 'finished';

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

  console.log('Rental statuses updated');
});