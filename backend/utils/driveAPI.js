require("dotenv").config();

const express = require("express");
const async = require("async");
const { google } = require("googleapis");

const key = require("../private_key.json");

/** 
 * @description Function that return the auth ServiceJWT
 * @params null
 * @return
 *      - jwToken: Object ???????????
 * @notes 
 *      - Check if authJWT is created (return JWT) or not (create new JWT and return)   ????
 */
const getAuthServiceJwt = () => {
  // Create new google auth JWT
  const jwToken = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    process.env.SERVICE_ACCOUNT_SCOPES,
    null
  );
  // Validate the jwToken
  jwToken.authorize((err) => {
    if (err) console.log("err: ", err);
    else console.log("Authorization successful");
  });

  return jwToken;
};


/** 
 * @description Asynchronous create permission for a specific drive folder
 * @params 
 *      - permissionList: Array[]
 *      - folderId: String
 * @return null
 *      
 * @notes 
 */
const insertPermissionsToFolderId = async (permissionList, folderId) => {
  
  const jwToken = await getAuthServiceJwt();

  const drive = google.drive({
    version: "v3",
    auth: jwToken,
  });

  // Asynchronous insert permission to folder
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
