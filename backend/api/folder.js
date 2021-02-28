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

const {
  getCoordinatorAccountByFaculty,
  getStudentAccountByFaculty,
} = require("../utils/dbService/index");

// const SCOPES =
//   "https://www.googleapis.com/auth/drive.file " +
//   "https://www.googleapis.com/auth/userinfo.profile " +
//   "https://www.googleapis.com/auth/drive.metadata ";

const eventFolderConstants = {
  acceptedArticlesFolderName: "Selected Articles",
  allArticlesFolderName: "All Articles",
};

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

router.get("/testt", async (req, res) => {
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
  jwToken.getAccessToken().then((result) => {
    // console.log(result)
    jwToken
      .getTokenInfo(result.token)
      .then((tokenInfo) => console.log(tokenInfo));
  });

  const drive = google.drive({
    version: "v3",
    auth: jwToken,
  });

  // drive.files.get({
  //   fileId: '1yEnOfJzvD9nrlSQVbJEHLwIHqm9QzgKu'
  // }).then(result => console.log(("file info: ", result))).catch(err => console.log(err))

  const a = {
    hihi: "name",
  };

  a.test = {
    hi: "",
  };

  a.test.hi = "lala";

  console.log(a);

  const query = getCoordinatorAccountByFacultyAndRole("1", "2");
  let queryResult = [];

  await query
    .then((result) => {
      console.log("result: ", result);
      queryResult = result;
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        messages: "Bad request",
      });
    });
});

router.get("/createEvent", async (req, res) => {
  // Not sure if file is retrieved by req.files or req.body
  const {
    title,
    content,
    startDate,
    endDate,
    lastUpdate,
    facultyId,
    file,
  } = req.body;

  // Get coordinator account of a faculty

  // const query1 = getCoordinatorAccountByFaculty("1");
  // let coordinatorAccounts = [];

  // await query1
  //   .then((result) => {
  //     console.log("result: ", result);
  //     coordinatorAccounts = result;
  //   })
  //   .catch((err) => {
  //     console.log("Err: ", err);
  //     return res.status(501).json({
  //       messages: "Bad request",
  //     });
  //   });

  // Get student account of a faculty
  const query2 = getStudentAccountByFaculty("2");
  let studentAccounts = [];

  await query2
    .then((result) => {
      console.log("result: ", result);
      studentAccounts = result;
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        messages: "Bad request",
      });
    });

  const eventData = {
    // title: title,
    // content: content,
    // startDate: startDate,
    // endDate: endDate,
    // lastUpdate: lastUpdate,
    // facultyId: facultyId,
    file_eventId: "",
    file_acceptedArticlesId: eventFolderConstants.acceptedArticles,
    file_allArticlesId: eventFolderConstants.allArticles,
  };

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

  const drive = google.drive({
    version: "v3",
    auth: jwToken,
  });

  const fileMetadata = {
    name: `Events name: ${Date.now().toString()}`,
    mimeType: "application/vnd.google-apps.folder",
    parents: ["1XcpJGtgrr_F-tsynzX6hrWD9dotwMqT6"],
  };

  const eventSubFolders = [
    {
      name: eventFolderConstants.acceptedArticlesFolderName,
    },
    {
      name: eventFolderConstants.allArticlesFolderName,
    },
  ];

  // let allArticlesFolderId = undefined;

  // ** Development code

  // var permissions = [
  //   {
  //     kind: "drive#permission",
  //     type: "user",
  //     role: "writer",
  //     emailAddress: "trungduc.dev@gmail.com",
  //     // permissionDetails: [
  //     //   {
  //     //     permissionType: "file",
  //     //     role: "writer",
  //     //     inherited: false
  //     //   }
  //     // ],
  //   },
  //   {
  //     kind: "drive#permission",
  //     type: "user",
  //     role: "writer",
  //     emailAddress: "ducdtgch18799@fpt.edu.vn",
  //   },
  // ];

  // Create permission constants

  // let coordinatorPermission = [];

  // coordinatorAccount.map((coordinator) => {
  //   coordinatorPermission.push({
  //     kind: "drive#permission",
  //     type: "user",
  //     role: "writer",
  //     emailAddress: coordinator.email,
  //     // permissionDetails: [
  //     //   {
  //     //     permissionType: "file",
  //     //     role: "writer",
  //     //     inherited: false
  //     //   }
  //     // ],
  //   });
  // });

  let studentPermission = [];

  studentAccounts.map((student) => {
    studentPermission.push({
      kind: "drive#permission",
      type: "user",
      role: "writer",
      emailAddress: student.email,
      // permissionDetails: [
      //   {
      //     permissionType: "file",
      //     role: "writer",
      //     inherited: false
      //   }
      // ],
    });
  });

  // Asynchronous create students permission for "All Articles" folder
  const insertPermission = async (allArticlesFolderId) => {
    async.eachSeries(
      studentPermission,
      (permission, callback) => {
        drive.permissions.create(
          {
            fileId: allArticlesFolderId,
            requestBody: permission,
            fields: "id",
            sendNotificationEmail: false,
            shared: false,
          },
          function (err, file) {
            if (err) {
              callback(err);
            } else {
              console.log(`Added ${permission.emailAddress} to All Articles`);
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

  await drive.files.create(
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

        // drive.coordinatorPermission.list(
        //   {
        //     fileId: "1pUXw72L0MO4I3390Gq4t3-7S4s_DSR1S",
        //   },
        //   function (err, res) {
        //     if (err) {
        //       console.error(err);
        //     } else {
        //       console.log("Permission: ", res.data.coordinatorPermission);
        //     }
        //   }
        // );

        eventData.file_eventId = file.data.id;

        const createEventSubfolder = new Promise((resolve, reject) => {
          let _subFolderId = {
            acceptedArticlesId: "",
            allArticlesId: "",
          };

          eventSubFolders.map((folder) => {
            const _eventSubFolder = {
              name: folder.name,
              mimeType: "application/vnd.google-apps.folder",
              parents: [file.data.id],
            };

            drive.files.create(
              {
                resource: _eventSubFolder,
                fields: "id",
              },
              function (err, file) {
                if (err) {
                  // Handle error
                  reject(err);
                  console.error(err);
                } else {
                  console.log(`${_eventSubFolder.name} Id: `, file.data.id);

                  if (
                    _eventSubFolder.name ==
                    eventFolderConstants.allArticlesFolderName
                  ) {
                    insertPermission(file.data.id);
                  }

                  /* Hardcoding !!!!!!!!!!!!!!!!!!!!! */
                  if (
                    folder.name ==
                    eventFolderConstants.acceptedArticlesFolderName
                  ) {
                    _subFolderId.acceptedArticlesId = file.data.id;
                    if(_subFolderId.acceptedArticlesId != "" && _subFolderId.allArticlesId != "") {
                      resolve(_subFolderId)
                    }
                  } else {
                    _subFolderId.allArticlesId = file.data.id;
                    if(_subFolderId.acceptedArticlesId != "" && _subFolderId.allArticlesId != "") {
                      resolve(_subFolderId)
                    }
                  }
                }
              }
            );
          });
        });

        createEventSubfolder
          .then((result) => {
            eventData.file_acceptedArticlesId = result.acceptedArticlesId;
            eventData.file_allArticlesId = result.allArticlesId;

            // Insert event info vao database
            console.log("event: ", eventData);
            
            res.status(201).json({
              eventInfo: eventData
            })
          })
          .catch((err) => console.log(err));
      }
    }
  );
});

// Update folder (Rename)
// Delete folder

module.exports = router;
