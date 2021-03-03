require("dotenv").config();

const express = require("express");
const async = require("async");
const { google } = require("googleapis");

const key = require("../private_key.json");

const getAuthServiceJwt = () => {
  const jwToken = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    process.env.SERVICE_ACCOUNT_SCOPES,
    null
  );
  jwToken.authorize((err) => {
    if (err) console.log("err: ", err);
    else console.log("Authorization successful");
  });

  return jwToken;
};

// Asynchronous create students permission for "All Articles" folder
const insertPermissionsToFolderId = async (permissionList, folderId) => {
  
  const jwToken = await getAuthServiceJwt();

  const drive = google.drive({
    version: "v3",
    auth: jwToken,
  });

  async.eachSeries(
    permissionList,
    (permission, callback) => {
      drive.permissions.create(
        {
          fileId: folderId,
          requestBody: permission,
          fields: "id",
          sendNotificationEmail: false,
          shared: false,
        },
        function (err, file) {
          if (err) {
            callback(err);
          } else {
            console.log(`Added ${permission.emailAddress} to Event`);
            // callback(err);           ????????????
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
};

module.exports = {
    insertPermissionsToFolderId: insertPermissionsToFolderId,
    getAuthServiceJwt: getAuthServiceJwt
};
