require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
const async = require("async")
const { google } = require("googleapis");

// Import modules & utils
const { getAuthUrl, getAuthClient } = require('../utils/auth')
const OAuth2Data = require("../credentials.json");

router.post("/createfolder", (req, res) => {
  const { folderName } = req.body;

  const oAuth2Client = getAuthClient()

  const drive = google.drive({
    version: "v3",
    auth: oAuth2Client,
  });

  // ** Development code
  var permissions = [
    {
      kind: "drive#permission",
      type: "user",
      role: "writer",
      emailAddress: "trungduc.dev@gmail.com",
    },
    {
      kind: "drive#permission",
      type: "user",
      role: "writer",
      emailAddress: "ducdtgch18799@fpt.edu.vn",
    },
  ];
  // **************************

  var fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    // starred: true,
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
        console.log("Folder Id: ", file.data.id);

        async.eachSeries(permissions, (permission, callback) => {
          drive.permissions.create(
            {
              fileId: file.data.id,
              requestBody: permission,
              fields: "id",
              sendNotificationEmail: false
            },
            function (err, file) {
              if (err) {
                console.error(err);
                callback(err);
              } else {
                console.log("done");
                callback(err);
              }
            }
          );
        }, (err) => {
          if (err) {
            // Handle error
            console.error(err);
          } else {
            // All permissions inserted
            console.log("All permissions inserted");
          }
        });
      }
    }
  );

  console.log("name: ", folderName);
})

// Update folder (Rename)
// Delete folder

module.exports = router;
