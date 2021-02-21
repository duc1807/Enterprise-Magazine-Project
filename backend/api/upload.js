require("dotenv").config();

const express = require("express");
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
const async = require("async");
const multer = require("multer");
const { google, Auth } = require("googleapis");

// Import modules from other files
const { getAuthClient, getUserProfile } = require("../utils/auth");


// Initialize Storage for file upload
var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./temp");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: Storage,
}).any("uploadedImages");

// ***********************************


router.post("/", async (req, res) => {
  let oAuth2Client = getAuthClient();

  upload(req, res, function (err) {
    if (err) throw err;
    console.log("files: ", req.files);

    const drive = google.drive({
      version: "v3",
      auth: oAuth2Client,
    });

    const folderId = "1FC5OAoz8bud4TGCjjaEyIzwJvJE4nSHY";

    const files = req.files;

    files.map((filedata, index) => {
      const filemetadata = {
        name: filedata.filename,
        parents: [folderId],
      };

      const media = {
        mimeType: filedata.mimetype,
        body: fs.createReadStream(filedata.path),
      };

      drive.files.create(
        {
          resource: filemetadata,
          media: media,
          fields: "id",
        },
        (err, file) => {
          if (err) throw err;
          // Delete the file in temp folder
          fs.unlinkSync(filedata.path);
        }
      );
    });
  });

  // Get user profile
  getUserProfile().then((userProfile) => {
    const { name, picture } = userProfile;
    if (name && picture)
      res.render("success", { name: name, pic: picture, success: true });
    else {
      console.log("err");
      //send 404 err
    }
  });
});

module.exports = router;
