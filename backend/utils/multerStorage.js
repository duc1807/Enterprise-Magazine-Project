const multer = require("multer");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./temp");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()} | ${file.originalname}`);
    },
});

exports.upload = multer({ storage: storage });