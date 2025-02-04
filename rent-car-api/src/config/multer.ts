import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request } from "express";
import ErrorHandler from "../utils/ErrorHandler";

const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: (Error | null), destination: string) => void): void => {
    cb(null, "public/images");
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: (Error | null), filename: string) => void): void => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ErrorHandler("Only image files are allowed!", 405));
    }
  },
});

export default upload;
