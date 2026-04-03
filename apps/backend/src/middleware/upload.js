import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

// Storage in memory to process with sharp
export const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Helper: สร้างโฟลเดอร์ถ้ายังไม่มี
const ensureDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Helper: ล้างอักขระพิเศษเพื่อให้ชื่อโครงการใช้เป็นชื่อโฟลเดอร์ได้
const sanitizeDirName = (name) => {
  if (!name) return "unknown";
  return name.toString()
    .replace(/[<>:"/\\|?*]/g, "") // ลบอักขระที่ Windows ไม่ยอมรับ
    .trim()
    .replace(/\s+/g, "_"); // เปลี่ยนช่องว่างเป็น underscore
};

// Helper: หา uploadDir ตาม subfolder ที่ตั้งไว้ใน req.uploadSubfolder
// และรองรับการแยกโฟลเดอร์ตามชื่อโครงการ (req.body.name)
const getUploadDir = (req) => {
  const baseSubfolder = req.uploadSubfolder || "";
  let finalPath = path.join(process.cwd(), "uploads", baseSubfolder);

  // ถ้าเป็น property และมีชื่อโครงการส่งมา ให้สร้าง subfolder แยกตามชื่อโครงการ
  if (baseSubfolder === "property" && req.body && req.body.name) {
    const propertyTitle = sanitizeDirName(req.body.name);
    finalPath = path.join(finalPath, propertyTitle);
  }

  return finalPath;
};

// Factory function: สร้าง middleware สำหรับกำหนด subfolder
export const setUploadFolder = (subfolder) => (req, _res, next) => {
  req.uploadSubfolder = subfolder;
  next();
};

// Middleware: optimize single image
export const optimizeImage = async (req, res, next) => {
  // If we have req.files (from upload.any()) but not req.file, pick the first one
  if (!req.file && req.files && req.files.length > 0) {
    req.file = req.files[0];
  }

  if (!req.file) return next();

  try {
    const uploadDir = getUploadDir(req);
    await ensureDir(uploadDir);

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
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`
  const outputPath = path.join(uploadDir, fileName)

  const buffer = await sharp(fileBuffer)
    .resize({ width: 1280 }) // จำกัดขนาดพอ
    .webp({ quality: 70 })   // ไม่ต้อง loop แล้ว
    .toBuffer()

  await fs.writeFile(outputPath, buffer)

  return {
    path: outputPath,
    filename: fileName,
    size: buffer.length,
    mimetype: "image/webp",
  }
}

// Middleware: optimize multiple uploaded images
export const optimizeImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next()

  try {
    const uploadDir = getUploadDir(req)
    await ensureDir(uploadDir)

    const results = []

    // ✅ ทำทีละรูป (ลด CPU spike)
    for (const file of req.files) {
      const result = await optimizeSingleFile(file.buffer, uploadDir)
      results.push(result)
    }

    req.files = req.files.map((file, i) => ({
      ...file,
      path: results[i].path,
      filename: results[i].filename,
      size: results[i].size,
      mimetype: results[i].mimetype,
    }))

    next()
  } catch (error) {
    console.error("Images optimization error:", error)
    next(error)
  }
}