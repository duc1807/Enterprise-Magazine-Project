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
  getCoordinatorAccountsByFaculty,
  getStudentAccountByFaculty,
  getFacultyById,
  createNewEvent,
  updateEvent,
} = require("../utils/dbService/index");
const { managerValidation } = require("./middleware/verification");
const {
  insertPermissionsToFolderId,
  getAuthServiceJwt,
} = require("../utils/driveAPI");
const { upload } = require("../utils/multerStorage");

// const SCOPES =
//   "https://www.googleapis.com/auth/drive.file " +
//   "https://www.googleapis.com/auth/userinfo.profile " +
//   "https://www.googleapis.com/auth/drive.metadata ";

const eventFolderConstants = {
  acceptedArticlesFolderName: "Selected Articles",
  allArticlesFolderName: "All Articles",
};

// POST: Create new event
router.post(
  "/createEvent",
  managerValidation,
  upload.single("file"),
  async (req, res) => {
    // Not sure if file is retrieved by req.files or req.body
    const { title, content, startDate, endDate, facultyId } = req.body;

    // Get coordinator account of a faculty

    const query = getCoordinatorAccountsByFaculty(facultyId);
    let coordinatorAccounts = [];

    await query
      .then((result) => {
        console.log("result: ", result);
        coordinatorAccounts = result;
      })
      .catch((err) => {
        console.log("Err: ", err);
        return res.status(501).json({
          messages: "Bad request",
        });
      });

    // Get faculty information
    const query1 = getFacultyById(facultyId);
    let facultyInfo = [];

    await query1
      .then((result) => {
        console.log("result: ", result);
        // Not sure ===========================================================
        facultyInfo = result[0];
      })
      .catch((err) => {
        // If database error
        if (!!err) {
          console.log("Err: ", err);
          return res.status(501).json({
            messages: "Bad request",
          });
        } else {
          // If no faculty found
          console.log("Err: ", err);
          return res.status(404).json({
            messages: "Faculty not found",
          });
        }
      });

    // Get student account of a faculty to gain permission to all articles folder ???
    // Should provide permission for student ????? -> To able to preview the articles?? Dont need bcs student only can view the posted articles
    const query2 = getStudentAccountByFaculty(facultyId);
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

    /* Image processing
    
    // const imageData = fs.readFileSync(req.file.path, "base64")

    // console.log("anh :", imageBase64);

    **/

    // Input end date processing
    let splittedDate = endDate.split("-");
    const newEndDate = new Date(
      splittedDate[0],
      splittedDate[1] - 1,
      splittedDate[2]
    ).getTime();
    console.log(newEndDate);

    // Get the current time
    const currentTime = new Date();

    // Create event data to INSERT into database
    const eventData = {
      title: title,
      content: content,
      // imageData: imageData,
      startDate: currentTime.getTime(),
      endDate: newEndDate,
      createdAt: currentTime.getTime(),
      lastUpdate: currentTime.getTime(),
      folderId: "",
      selectedArticles: eventFolderConstants.acceptedArticles,
      allArticles: eventFolderConstants.allArticles,
      FK_faculty_id: facultyId,
    };

    const jwToken = await getAuthServiceJwt();

    const drive = google.drive({
      version: "v3",
      auth: jwToken,
    });

    console.log("faculty tra ve: ", facultyInfo);

    const fileMetadata = {
      name: `${currentTime.toLocaleDateString()}: ${
        eventData.title
      } - ${currentTime.getTime()}`,
      mimeType: "application/vnd.google-apps.folder",
      parents: [facultyInfo.faculty_folderId],
    };

    // Default subfolder of each Event folder
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

    let coordinatorPermissions = [];

    coordinatorAccounts.map((coordinator) => {
      coordinatorPermissions.push({
        kind: "drive#permission",
        type: "user",
        role: "writer",
        emailAddress: coordinator.email,
      });
    });

    let studentPermissions = [];

    studentAccounts.map((student) => {
      studentPermissions.push({
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

    // // Asynchronous create students permission for "All Articles" folder
    // const insertPermission = async(allArticlesFolderId) => {
    //     async.eachSeries(
    //         studentPermissions,
    //         (permission, callback) => {
    //             drive.permissions.create({
    //                     fileId: allArticlesFolderId,
    //                     requestBody: permission,
    //                     fields: "id",
    //                     sendNotificationEmail: false,
    //                     shared: false,
    //                 },
    //                 function(err, file) {
    //                     if (err) {
    //                         callback(err);
    //                     } else {
    //                         console.log(`Added ${permission.emailAddress} to All Articles`);
    //                         // callback(err);           ????????????
    //                     }
    //                 }
    //             );
    //         },
    //         (err) => {
    //             if (err) {
    //                 // Handle error
    //                 console.error(err);
    //             } else {
    //                 // All permissions inserted
    //                 console.log("All permissions inserted");
    //             }
    //         }
    //     );
    // };

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

          // drive.coordinatorPermissions.list(
          //   {
          //     fileId: "1pUXw72L0MO4I3390Gq4t3-7S4s_DSR1S",
          //   },
          //   function (err, res) {
          //     if (err) {
          //       console.error(err);
          //     } else {
          //       console.log("Permission: ", res.data.coordinatorPermissions);
          //     }
          //   }
          // );

          insertPermissionsToFolderId(coordinatorPermissions, file.data.id);

          eventData.folderId = file.data.id;

          const createEventSubfolder = new Promise((resolve, reject) => {
            let _subFolderId = {
              acceptedArticlesId: "",
              allArticlesId: "",
            };

            // Create the subfolder in Event folder
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

                    // If folder is all articles, insert the permission for student
                    if (
                      _eventSubFolder.name ==
                      eventFolderConstants.allArticlesFolderName
                    ) {
                      // insertPermissionsToFolderId(studentPermissions, file.data.id);
                    }

                    /* Hardcoding !!!!!!!!!!!!!!!!!!!!! */
                    if (
                      folder.name ==
                      eventFolderConstants.acceptedArticlesFolderName
                    ) {
                      _subFolderId.acceptedArticlesId = file.data.id;
                      // If the id of all folders are set, resolve promise and return value
                      if (
                        _subFolderId.acceptedArticlesId != "" &&
                        _subFolderId.allArticlesId != ""
                      ) {
                        resolve(_subFolderId);
                      }
                    } else {
                      _subFolderId.allArticlesId = file.data.id;
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

          createEventSubfolder
            .then((result) => {
              eventData.selectedArticles = result.acceptedArticlesId;
              eventData.allArticles = result.allArticlesId;

              // Insert event info vao database
              console.log("event: ", eventData);

              createNewEvent(eventData)
                .then((result) => {
                  console.log("ket qua: ", result);
                  return res.status(201).json({
                    eventInfo: eventData,
                  });
                })
                .catch((err) => {
                  if (!!err) {
                    console.log(err);
                    return res.status(500).json({
                      success: false,
                      message: "Server error!",
                    });
                  } else {
                    return res.status(404).json({
                      success: false,
                      message: "Faculty not found!",
                    });
                  }
                });
            })
            .catch((err) => console.log(err));
        }
      }
    );
  }
);

// POST: Update event
router.post(
  "/updateEvent",
  managerValidation,
  upload.single("file"),
  (req, res) => {
    const {
      id,
      title,
      content,
      // imageData,
      startDate,
      endDate,
      folderId,
      FK_faculty_id,
    } = req.body;

    /// Image base64 encoded upload

    /* Check which fields is need to be updated !!!!!!!!!!!!!!! */

    // var img = fs.readFileSync(req.file.path);
    // console.log("path: ", req.file);
    // var encode_image = img.toString("base64");

    // var finalImg = {
    //     contentType: req.file.mimetype,
    //     image: new Buffer.from(encode_image, "base64"),
    // };

    // console.log("finalll: ", finalImg);

    // Input start and end date processing
    let splittedStartDate = startDate.split("-");
    const newStartDate = new Date(
      splittedStartDate[0],
      splittedStartDate[1] - 1,
      splittedStartDate[2]
    ).getTime();
    console.log(newStartDate);

    let splittedEndDate = endDate.split("-");
    const newEndDate = new Date(
      splittedEndDate[0],
      splittedEndDate[1] - 1,
      splittedEndDate[2]
    ).getTime();
    console.log(newEndDate);

    const currentTime = new Date();
    const data = {
      id: id,
      title: title,
      content: content,
      // imageData: imageData,
      startDate: newStartDate,
      endDate: newEndDate,
      lastUpdate: currentTime.getTime(),
      // folderId,
      FK_faculty_id: FK_faculty_id,
    };

    console.log(data);

    updateEvent(data)
      .then((result) => {
        return res.status(500).json({
          success: true,
          message: `Event ${title} updated successfully.`,
        });
      })
      .catch((err) => {
        if (!!err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Server error!",
          });
        } else {
          return res.status(404).json({
            success: false,
            message: "Not found!",
          });
        }
      });
  }
);


// ================================================================ TEST UPLOAD

const multer = require("multer");
const fs = require("fs");
const mysql = require("mysql2");
const { dbconfig } = require("../utils/config/dbconfig");
const { type } = require("os");

// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "./temp");
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// var upload = multer({ storage: storage });

router.get("/updateEvent", (req, res) => {
  res.render("updateEvent");
});

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

router.get("/uploadimage", (req, res) => {
  res.render("imageUpload");
});

router.post("/uploadimage", upload.single("file"), (req, res) => {
  console.log("chay vao router");
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });

  // const imageFilter = (req, file, cb) => {
  //     if (file.mimetype.startsWith("image")) {
  //         cb(null, true);
  //     } else {
  //         cb("Please upload only images.", false);
  //     }
  // };

  var img = fs.readFileSync(req.file.path);
  const test = fs.readFileSync(req.file.path, "base64");
  var encode_image = img.toString("base64");

  var finalImg = {
    contentType: req.file.mimetype,
    image: new Buffer.from(encode_image, "base64"),
  };

  console.log("finalll: ", test);

  const final = JSON.stringify(finalImg);

  let sql = `INSERT INTO Test (image)
              VALUES ('${test}')`;

  connection.query(sql, (err, result) => {
    if (err) throw err;
    // Check if the Faculty is existed or not
    let a = finalImg.image;
    console.log("resultt: ", a);
    fs.unlinkSync(req.file.path);
    res.contentType("image/jpeg");
    res.send(finalImg.image);
  });

  // uploadFile.single()

  const uploadFiles = async (file) => {
    console.log(file);
    // try {

    //   if (req.file == undefined) {
    //     return res.send(`You must select a file.`);
    //   }

    //   Image.create({
    //     type: req.file.mimetype,
    //     name: req.file.originalname,
    //     data: fs.readFileSync(
    //       __basedir + "/resources/static/assets/uploads/" + req.file.filename
    //     ),
    //   }).then((image) => {
    //     fs.writeFileSync(
    //       __basedir + "/resources/static/assets/tmp/" + image.name,
    //       image.data
    //     );

    //     return res.send(`File has been uploaded.`);
    //   });
    // } catch (error) {
    //   console.log(error);
    //   return res.send(`Error when trying upload images: ${error}`);
    // }
  };
});

// Update folder (Rename)
// Delete folder

router.get("/testDate", (req, res) => {
  res.render("date");
});

router.post("/testDate", (req, res) => {
  let { date } = req.body;
  let splittedDate = date.split("-");
  var newDate = new Date(splittedDate[0], splittedDate[1] - 1, splittedDate[2]);
  console.log(splittedDate);
  console.log(newDate.getTime());
});

module.exports = router;
