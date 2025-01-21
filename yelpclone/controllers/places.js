import { PrismaClient } from "@prisma/client";
import fs from "fs";
import ErrorHandler from "../utils/ErrorHandler.js";
import { geometry } from "../utils/hereMaps.js";

const prisma = new PrismaClient();

const PlaceController = {
  index: async (req, res) => {
    const places = await prisma.place.findMany({
      include: {
        images: true,
      },
    });

    const clusteringPlaces = places.map((place) => {
      return {
        latitude: place.geometry.coordinates[1],
        longitude: place.geometry.coordinates[0],
      };
    });

    const clusteredPlace = JSON.stringify(clusteringPlaces);

    res.render("places", { places, clusteredPlace });
  },
  show: async (req, res) => {
    const { id } = req.params;
    const place = await prisma.place.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
        reviews: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });
    res.render("places/show", { place });
  },
  new: (req, res) => {
    res.render("places/create");
  },
  edit: async (req, res) => {
    const { id } = req.params;
    const place = await prisma.place.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
      },
    });
    res.render("places/edit", { place });
  },
  store: async (req, res) => {
    const images = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));

    const geoData = await geometry(req.body.place.location);

    await prisma.place.create({
      data: {
        ...req.body.place,
        price: parseInt(req.body.place.price),
        images: { create: images },
        geometry: geoData,
        author: {
          connect: { id: req.user.id },
        },
      },
    });
    req.flash("success", "Place created successfully");
    res.redirect("/places");
  },
  update: async (req, res) => {
    const { id } = req.params;

    const existingPlace = await prisma.place.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
      },
    });

    if (!existingPlace) {
      req.flash("error", "Place not found");
      return res.redirect("/places");
    }

    if (req.files && req.files.length > 0) {
      existingPlace.images.forEach((image) => {
        fs.unlink(image.url, (err) => new ErrorHandler(err));
      });
    }

    const newImages = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));

    const geoData = await geometry(req.body.place.location);

    await prisma.place.update({
      where: { id: parseInt(id) },
      data: {
        ...req.body.place,
        price: parseInt(req.body.place.price),
        geometry: geoData,
        images: {
          deleteMany: {},
          create: newImages,
        },
      },
    });
    req.flash("success", "Place updated successfully");
    res.redirect(`/places/${id}`);
  },
  destroy: async (req, res) => {
    const { id } = req.params;
    const place = await prisma.place.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
      },
    });

    if (!place) {
      req.flash("error", "Place not found");
      return res.redirect("/places");
    }

    place.images.forEach((image) => {
      fs.unlink(image.url, (err) => new ErrorHandler(err));
    });

    await prisma.place.delete({
      where: { id: parseInt(id) },
    });

    req.flash("success", "Place deleted successfully");
    res.redirect("/places");
  },
  deleteImage: async (req, res) => {
    const { id } = req.params;
    const { images } = req.body;

    if (!images || images.length === 0) {
      req.flash("error", "Please select at least one image");
      return res.redirect(`/places/${id}/edit`);
    }

    images.forEach((image) => {
      fs.unlinkSync(image);
    });

    await prisma.image.deleteMany({
      where: {
        url: {
          in: images,
        },
      },
    });

    req.flash("success", "Images deleted successfully");
    res.redirect(`/places/${id}/edit`);
  },
};

export default PlaceController;
