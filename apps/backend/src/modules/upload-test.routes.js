import { upload, optimizeImage, optimizeImages } from "../middleware/upload.js";
import express from "express";

const router = express.Router();

// Single file upload
router.post("/test-upload", upload.single("image"), optimizeImage, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.status(200).json({
    message: "File uploaded and optimized successfully",
    file: {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    },
  });
});

// Multi-file upload (max 10 files)
router.post("/test-upload-multi", upload.array("images", 10), optimizeImages, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  res.status(200).json({
    message: `${req.files.length} file(s) uploaded and optimized successfully`,
    files: req.files.map((file) => ({
      originalname: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    })),
  });
});

export default router;
