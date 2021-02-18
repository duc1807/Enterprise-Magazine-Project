const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
require("dotenv").config();

const { google } = require("googleapis");

const OAuth2Data = require("../credentials.json");

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URI = OAuth2Data.web.redirect_uris[0];

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

router.post("/createfolder", (req, res) => {
  const { folderName } = req.body;

  const drive = google.drive({
    version: "v3",
    auth: oAuth2Client,
  });

  var fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };
  drive.files.create(
    {
      resource: fileMetadata,
      fields: "id",
    },
    function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        console.log("Folder Id: ", file.id);
      }
    }
  );

  console.log("name: ", folderName);
});

module.exports = router;
