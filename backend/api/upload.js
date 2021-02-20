require("dotenv").config();

const express = require("express");
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
const async = require("async");
const multer = require("multer");
const { google, Auth } = require("googleapis");

const { getAuthClient, getUserProfile } = require("../utils/auth");

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

router.post("/", async (req, res) => {
  let oAuth2Client = getAuthClient();

  //   const oauth2 = google.oauth2({
  //     auth: oAuth2Client,
  //     version: "v2",
  //   });

  upload(req, res, function (err) {
    if (err) throw err;
    console.log("files: ", req.files);
    // console.log("name: ", req.file.filename);

    const drive = google.drive({
      version: "v3",
      auth: oAuth2Client,
    });

    var folderId = "1FC5OAoz8bud4TGCjjaEyIzwJvJE4nSHY";

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
          // delete the file images folder
          fs.unlinkSync(filedata.path);
        }
      );
    });
  });
  // user info

  getUserProfile().then((userProfile) => {
    const { name, picture } = userProfile;
    if (name && picture)
      res.render("success", { name: name, pic: picture, success: true });
    else {
      console.log("err");
      //send 404 err
    }
  });

  //   oauth2.userinfo.get((err, response) => {
  //     if (err) throw err; // Send 404 err

  //     console.log(response.data);

  //     name = response.data.name;
  //     pic = response.data.picture;
  //     console.log("trong getinfo: ", pic);
  //     res.render("success", { name: name, pic: pic, success: true });
  //   });
});

module.exports = router;
