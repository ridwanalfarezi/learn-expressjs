import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ReviewController = {
  store: async (req, res) => {
    const review = req.body.review;
    const { placeId } = req.params;

    await prisma.review.create({
      data: {
        rating: parseInt(review.rating),
        comment: review.comment,
        author: {
          connectOrCreate: {
            where: { id: req.user.id },
            create: req.user,
          },
        },
        Place: {
          connect: { id: parseInt(placeId) },
        },
      },
    });

    req.flash("success", "Review added successfully");

    res.redirect(`/places/${placeId}`);
  },
  destroy: async (req, res) => {
    const { placeId, reviewId } = req.params;
    await prisma.review.delete({
      where: { id: parseInt(reviewId) },
    });

    req.flash("success", "Review deleted successfully");
    res.redirect(`/places/${placeId}`);
  },
};

export default ReviewController;
