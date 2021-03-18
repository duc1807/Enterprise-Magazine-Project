const multer = require("multer");

// Create a storage for storing temp file
const storage = multer.diskStorage({
    // The destination to store temp file
    destination: (req, file, cb) => {
        cb(null, "./temp");
    },
    // Custom the file name: "[Timestamp] file_name"
    filename: (req, file, cb) => {
        cb(null, `[${Date.now()}] ${file.originalname}`);
    },
});

exports.upload = multer({ storage: storage });
