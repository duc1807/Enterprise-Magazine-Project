require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
const async = require("async");
const { google } = require("googleapis");

// Import modules & utils
const { getAuthUrl, getAuthClient } = require("../utils/auth");
const OAuth2Data = require("../credentials.json");
const key = require("../private_key.json");

const SCOPES =
  "https://www.googleapis.com/auth/drive.file " +
  "https://www.googleapis.com/auth/userinfo.profile " +
  "https://www.googleapis.com/auth/drive.metadata ";

router.post("/createfolder", (req, res) => {
  const { folderName } = req.body;

  const oAuth2Client = getAuthClient();

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

  const fileMetadata = {
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

        async.eachSeries(
          permissions,
          (permission, callback) => {
            drive.permissions.create(
              {
                fileId: file.data.id,
                requestBody: permission,
                fields: "id",
                sendNotificationEmail: false,
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
          },
          (err) => {
            if (err) {
              // Handle error
              console.error(err);
            } else {
              // All permissions inserted
              console.log("All permissions inserted");
            }
          }
        );
      }
    }
  );

  console.log("name: ", folderName);
});

router.get("/createEvent", (req, res) => {
  const jwToken = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    SCOPES,
    null
  );
  jwToken.authorize((err) => {
    if (err) console.log("err: ", err);
    else console.log("Authorization successful");
  });

  const drive = google.drive({
    version: "v3",
    auth: jwToken,
  });

  const fileMetadata = {
    name: "Test events",
    mimeType: "application/vnd.google-apps.folder",
    parents: ["1LE66TBX2vqqdijNAnty1N6IR43LybXRP"],
    // starred: true,
  };

  const eventFolders = [
    {
      name: "Selected Articles",
    },
    {
      name: "All Articles",
    },
  ];

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
        console.log("Event folder Id: ", file.data.id);

        eventFolders.map((folder) => {
          const _eventFolder = {
            name: folder.name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [file.data.id],
          };
          drive.files.create(
            {
              resource: _eventFolder,
              fields: "id",
            },
            function (err, file) {
              if (err) {
                // Handle error
                console.error(err);
              } else {
                console.log(`${_eventFolder.name} Id: `, file.data.id);
              }
            }
          );
        });
      }
    }
  );
});

// Update folder (Rename)
// Delete folder

module.exports = router;
