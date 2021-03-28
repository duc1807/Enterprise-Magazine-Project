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

/**
 * @description move article submission folder of student to "Selected Article" folder on Drive
 * @params
 *      - Article info INNER JOIN Event info
 * @return null
 * @notes
 *      - Using try catch to retry in case the drive API is down
 */
const moveFolderToOtherFolder = async (articleAndEventInfo) => {
  const data = articleAndEventInfo;
  const jwToken = await getAuthServiceJwt();

  const drive = google.drive({
    version: "v3",
    auth: jwToken,
  });

  drive.files.update(
    {
      fileId: data.article_folderId,
      addParents: data.folderId_selectedArticles,
      removeParents: data.folderId_allArticles,
      fields: "id, parents",
    },
    function (err, file) {
      if (err) {
        console.log(err);
      } else {
        console.log("Article folder moved to selected article successfully");
      }
    }
  );
};

const deleteFileOnDrive = async (fileDriveId) => {
  // Get jwt auth service
  const jwToken = await getAuthServiceJwt();
  const drive = google.drive({
    version: "v3",
    auth: jwToken,
  });

  drive.files.delete(
    {
      fileId: `${fileDriveId}`
    },
    async (err, file) => {
      if (err) {
        console.log("Err: ", err);
      }
      console.log(`File ${fileDriveId} removed successful`);
    }
  );
};

module.exports = {
  insertPermissionsToFolderId: insertPermissionsToFolderId,
  getAuthServiceJwt: getAuthServiceJwt,
  moveFolderToOtherFolder: moveFolderToOtherFolder,
  deleteFileOnDrive: deleteFileOnDrive,
};
