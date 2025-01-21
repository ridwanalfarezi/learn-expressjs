import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const isAuthorPlace = async (req, res, next) => {
  const { id } = req.params;
  let place = await prisma.place.findUnique({
    where: { id: parseInt(id) },
  });

  if (place.authorId !== req.user.id) {
    req.flash("error", "You are not the authorized");
    return res.redirect("/places");
  }

  next();
};
const isAuthorReview = async (req, res, next) => {
  const { placeId, reviewId } = req.params;
  let review = await prisma.review.findUnique({
    where: { id: parseInt(reviewId) },
  });

  if (review.authorId !== req.user.id) {
    req.flash("error", "You are not the authorized");
    return res.redirect(`/places/${placeId}`);
  }

  next();
};

export { isAuthorPlace, isAuthorReview };
