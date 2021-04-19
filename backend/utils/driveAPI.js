require("dotenv").config();

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
        // All permissions inserted successful
        console.log("All permissions inserted");
      }
    }
  );
};

/**
 * @description Move article submission folder of student to "Selected Article" folder on Drive
 * @params
 *      - Article info INNER JOIN Event info
 * @return null
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
      fileId: `${fileDriveId}`,
    },
    async (err, file) => {
      if (err) {
        console.log("Err: ", err);
      }
      console.log(`File ${fileDriveId} removed successful`);
    }
  );
};

/**
 * @description Create new folder on Drive
 * @params
 *      - folderMetadata: Object
 *          {
 *             name: String,
 *             mimeType: String,
 *             parents: [String]
 *          }
 * @return
 *      - folderId: String
 * @notes
 */
const createFolder = async (folderMetadata) => {
  return new Promise(async (resolve, reject) => {
    // Get jwt auth service
    const jwToken = await getAuthServiceJwt();
    const drive = google.drive({
      version: "v3",
      auth: jwToken,
    });

    await drive.files.create(
      {
        resource: folderMetadata,
        fields: "id",
      },
      function (err, file) {
        if (err) {
          // Handle error
          reject(err);
        } else {
          resolve(file.data.id);
        }
      }
    );
  });
};

/**
 * @description Create new sub-folders inside a drive folder
 * @params
 *      - subFoldersName: Array[Object]
 *          [
 *            {
 *              name: String
 *            },
 *            ...
 *          ]
 *      - subFolderConstants: Object
 *          {
 *            acceptedArticlesFolderName: String,
 *            allArticlesFolderName: String
 *          }
 *      - parentsFolderId: String
 * @return
 *      - subFolderId: Object
 *          {
 *            acceptedArticlesId: String
 *            allArticlesId: String
 *          }
 * @notes
 */
const createSubFolders = (
  subFoldersName,
  subFolderConstants,
  parentsFolderId
) => {
  return new Promise(async (resolve, reject) => {
    // Get authService
    const jwToken = await getAuthServiceJwt();
    const drive = google.drive({
      version: "v3",
      auth: jwToken,
    });

    // Generate Object for storing subfolderId
    let _subFolderId = {
      acceptedArticlesId: "",
      allArticlesId: "",
    };

    subFoldersName.map((folder) => {
      const subFolderMetadata = {
        name: folder.name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentsFolderId],
      };

      drive.files.create(
        {
          resource: subFolderMetadata,
          fields: "id",
        },
        function (err, file) {
          if (err) {
            // Handle error
            reject(err);
            console.error(err);
          } else {
            // If folder is all articles, insert the permission for student
            if (
              subFolderMetadata.name == subFolderConstants.allArticlesFolderName
            ) {
              // insertPermissionsToFolderId(studentPermissions, file.data.id);
            }

            // If the folder is selected articles, assign the folderId to '_subFolderId' Object
            if (folder.name == subFolderConstants.acceptedArticlesFolderName) {
              _subFolderId.acceptedArticlesId = file.data.id;
              // If the id of all fields in '_subFolderId' are set, resolve promise and return value
              if (
                _subFolderId.acceptedArticlesId != "" &&
                _subFolderId.allArticlesId != ""
              ) {
                resolve(_subFolderId);
              }
            }
            // Else if the folder is all articles, asssign folderId to '_subFolderId' Object
            else {
              _subFolderId.allArticlesId = file.data.id;
              // If the id of all fields in '_subFolderId' are set, resolve promise and return value
              if (
                _subFolderId.acceptedArticlesId != "" &&
                _subFolderId.allArticlesId != ""
              ) {
                resolve(_subFolderId);
              }
            }
          }
        }
      );
    });
  });
};

/**
 * @description Create new faculties folders inside GW root drive folder
 * @params
 *      - facultiesFoldersName: Array[Object]
 *          [
 *            {
 *              name: String
 *            },
 *            ...
 *          ]
 *      - facultiesFolderConstants: Object
 *          {
 *            facultyIt: String,
 *            facultyBusiness: String,
 *            facultyMarketing: String
 *          }
 *      - parentsFolderId: String
 * @return
 *      - facultiesFolderId: Object
 *          {
 *            facultyIt: String,
 *            facultyBusiness: String,
 *            facultyMarketing: String
 *          }
 * @notes
 */
const createFacultiesFolders = (
  facultiesFoldersName,
  facultiesFolderConstants,
  parentsFolderId
) => {
  return new Promise(async (resolve, reject) => {
    // Get authService
    const jwToken = await getAuthServiceJwt();
    const drive = google.drive({
      version: "v3",
      auth: jwToken,
    });

    // Generate Object for storing subfolderId\
    let _facultiesFoldersId = {};
    let arrayFacultyName = [];

    for (const facultyName in facultiesFolderConstants) {
      _facultiesFoldersId[facultyName] = facultiesFolderConstants[facultyName];
      arrayFacultyName.push(facultiesFolderConstants[facultyName]);
    }

    facultiesFoldersName.map((folder) => {
      const facultyFolderMetadata = {
        name: folder.name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentsFolderId],
      };

      drive.files.create(
        {
          resource: facultyFolderMetadata,
          fields: "id",
        },
        function (err, file) {
          if (err) {
            // Handle error
            reject(err);
            console.error(err);
          } else {
            console.log(`${facultyFolderMetadata.name} Id: `, file.data.id);

            // Check to set the folderId to its correct faculty
            for (const facultyFolderId in _facultiesFoldersId) {
              if (
                _facultiesFoldersId[facultyFolderId] ==
                facultyFolderMetadata.name
              ) {
                _facultiesFoldersId[facultyFolderId] = file.data.id;
              }
              // Check if all properties of "_facultiesFoldersId" have value
              let isFulfilled = true;
              for (const facultyFolderId in _facultiesFoldersId) {
                // If a property of "_facultiesFoldersId" does not have value
                // set isFulfilled = false
                if (
                  arrayFacultyName.includes(
                    _facultiesFoldersId[facultyFolderId]
                  )
                ) {
                  isFulfilled = false;
                }
              }
              // If all properties of "_facultiesFoldersId" have value
              // Resolve result
              if (isFulfilled) {
                resolve(_facultiesFoldersId);
              }
            }
          }
        }
      );
    });
  });
};

module.exports = {
  insertPermissionsToFolderId: insertPermissionsToFolderId,
  getAuthServiceJwt: getAuthServiceJwt,
  moveFolderToOtherFolder: moveFolderToOtherFolder,
  deleteFileOnDrive: deleteFileOnDrive,
  createFolder: createFolder,
  createSubFolders: createSubFolders,
  createFacultiesFolders: createFacultiesFolders,
};
