import crypto from "crypto";
import { Request } from "express";
import multer, { FileFilterCallback, StorageEngine } from "multer";
import path from "path";
import ErrorHandler from "../utils/ErrorHandler";

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ): void => {
    cb(null, "public/images");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ): void => {
    // Sanitize filename - gunakan random hash untuk keamanan
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${randomName}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Batas Maksimal 2MB (Mencegah DoS storage)
    files: 1, // Only 1 file per request
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void => {
    // Whitelist tipe file: Hanya boleh gambar dengan extension yang diizinkan
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(
        new ErrorHandler(
          "Hanya diperbolehkan upload file gambar (jpg, jpeg, png, webp)!",
          400
        )
      );
    }
  },
});

export default upload;
