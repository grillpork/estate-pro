import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

// Storage in memory to process with sharp
export const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

export const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const uploadDir = path.join(process.cwd(), "uploads");

    // Ensure upload directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = `${uniqueSuffix}.webp`;
    const outputPath = path.join(uploadDir, fileName);

    let quality = 80;
    let currentBuffer;

    // Initial conversion to WebP
    currentBuffer = await sharp(req.file.buffer)
      .webp({ quality })
      .toBuffer();

    // Loop to optimize if file size > 150KB
    while (currentBuffer.length > 150 * 1024 && quality > 20) {
      quality -= 10;
      currentBuffer = await sharp(req.file.buffer)
        .webp({ quality })
        .toBuffer();
    }

    // If still > 150KB, reduce resolution
    if (currentBuffer.length > 150 * 1024) {
      const metadata = await sharp(req.file.buffer).metadata();
      if (metadata.width) {
        let currentWidth = metadata.width;
        while (currentBuffer.length > 150 * 1024 && currentWidth > 400) {
          currentWidth = Math.round(currentWidth * 0.8);
          currentBuffer = await sharp(req.file.buffer)
            .resize({ width: currentWidth })
            .webp({ quality: 20 })
            .toBuffer();
        }
      }
    }

    // Save optimized file
    await fs.writeFile(outputPath, currentBuffer);

    // Update req.file information for the controller
    req.file.path = outputPath;
    req.file.filename = fileName;
    req.file.size = currentBuffer.length;
    req.file.mimetype = "image/webp";

    next();
  } catch (error) {
    console.error("Image optimization error:", error);
    next(error);
  }
};
