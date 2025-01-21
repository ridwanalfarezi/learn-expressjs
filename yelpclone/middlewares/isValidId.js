import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const isValidId = (redirectUrl = "/") => {
  return async (req, res, next) => {
    const paramId = ["reviewId", "id", "placeId"].find(
      (param) => req.params[param]
    );

    if (!paramId) return next();

    const id = parseInt(req.params[paramId]);

    if (isNaN(id)) {
      req.flash("error", `${paramId} must be a valid number`);
      return res.redirect(redirectUrl);
    }

    let found;

    if (paramId === "reviewId") {
      found = await prisma.review.findUnique({
        where: { id },
      });
    } else {
      found = await prisma.place.findUnique({
        where: { id },
      });
    }

    if (!found) {
      const notFoundEntity =
        paramId === "reviewId"
          ? "Review"
          : "Place";
      req.flash("error", `${notFoundEntity} with ID ${id} not found`);
      return res.redirect(redirectUrl);
    }

    next();
  };
};
