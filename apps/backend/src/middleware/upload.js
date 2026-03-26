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

// Helper: optimize a single file buffer and save to disk
const optimizeSingleFile = async (fileBuffer, uploadDir) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileName = `${uniqueSuffix}.webp`;
  const outputPath = path.join(uploadDir, fileName);

  let quality = 80;
  let currentBuffer;

  // Initial conversion to WebP
  currentBuffer = await sharp(fileBuffer).webp({ quality }).toBuffer();

  // Loop to optimize if file size > 150KB
  while (currentBuffer.length > 150 * 1024 && quality > 20) {
    quality -= 10;
    currentBuffer = await sharp(fileBuffer).webp({ quality }).toBuffer();
  }

  // If still > 150KB, reduce resolution
  if (currentBuffer.length > 150 * 1024) {
    const metadata = await sharp(fileBuffer).metadata();
    if (metadata.width) {
      let currentWidth = metadata.width;
      while (currentBuffer.length > 150 * 1024 && currentWidth > 400) {
        currentWidth = Math.round(currentWidth * 0.8);
        currentBuffer = await sharp(fileBuffer)
          .resize({ width: currentWidth })
          .webp({ quality: 20 })
          .toBuffer();
      }
    }
  }

  // Save optimized file
  await fs.writeFile(outputPath, currentBuffer);

  return { path: outputPath, filename: fileName, size: currentBuffer.length, mimetype: "image/webp" };
};

// Middleware: optimize multiple uploaded images
export const optimizeImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    const uploadDir = path.join(process.cwd(), "uploads");

    // Ensure upload directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Process all files in parallel
    const results = await Promise.all(
      req.files.map((file) => optimizeSingleFile(file.buffer, uploadDir))
    );

    // Update req.files with optimized info
    req.files = req.files.map((file, i) => ({
      ...file,
      path: results[i].path,
      filename: results[i].filename,
      size: results[i].size,
      mimetype: results[i].mimetype,
    }));

    next();
  } catch (error) {
    console.error("Images optimization error:", error);
    next(error);
  }
};
