const multer = require("multer");
const fs = require("fs");
const mysql = require("mysql2");
const { dbconfig } = require("./config/dbconfig");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./temp");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

exports.upload = multer({ storage: storage });