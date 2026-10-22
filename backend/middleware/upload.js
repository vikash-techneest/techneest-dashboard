const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const ApiError = require("../utils/ApiError");

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
];

const createUploader = (subFolder = "documents", maxFileSizeMB = 5) => {
  const uploadDir = path.join(__dirname, "..", "uploads", subFolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "");
      const safeUniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
      cb(null, safeUniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          400,
          `Unsupported file type (${file.mimetype}). Allowed types: PDF, JPG, PNG, WEBP, DOC, DOCX, TXT, CSV.`
        ),
        false
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSizeMB * 1024 * 1024,
    },
  });
};

module.exports = {
  uploadDocument: createUploader("documents", 5),
  uploadTaskAttachment: createUploader("tasks", 10),
};
