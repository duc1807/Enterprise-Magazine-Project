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
  // Account services
  getCoordinatorAccountsByFaculty,
  getStudentAccountByFaculty,

  // Faculty services
  getFacultyById,

  // Event services
  createNewEvent,
  updateEvent,
  publishEventById,
  deleteEventById,
  getEventById,
  getPublishedEventOfFacultyId,
  // Article services
  getPostedArticlesOfEvent,
  getSubmittedArticles,
  getSelectedArticles,
  getRejectedArticles,
} = require("../utils/dbService/index");

// Import middleware validation
const {
  managerValidation,
  gwAccountValidation,
  coordinatorValidation,
} = require("./middleware/verification");

// Import utils
const {
  insertPermissionsToFolderId,
  getAuthServiceJwt,
  createFolder,
  createSubFolders,
} = require("../utils/driveAPI");
const { upload } = require("../utils/multerStorage");

// const SCOPES =
//   "https://www.googleapis.com/auth/drive.file " +
//   "https://www.googleapis.com/auth/userinfo.profile " +
//   "https://www.googleapis.com/auth/drive.metadata ";

// Constants
const eventImageFolderId = "1GiaqwUdxaL5kNFS7HhEArmduStkRwamT";
const eventSubFoldersConstant = {
  acceptedArticlesFolderName: "Selected Articles",
  allArticlesFolderName: "All Articles",
};
const _MANAGER_ROLE_ID = 3;

// ================================================= DEVELOPMENT CODE

/**
 * @method GET
 * @api /api/events/published?faculty=(facultyId)
 * @permissions
 *      - Anyone (with account)
 * @description API for getting published event information
 * @params
 *      - eventId: Int (req.params)
 * @return
 *      - events: Array[]
 *          + .................................. ???
 * @notes
 *      - Should put this API before /api/events/:eventId -> the request will run into that API
 *      - Permission for all ??? If true, all account and specially guest account should have faculty_id field inside userInfo
 */
router.get("/published", gwAccountValidation, async (req, res) => {
  // Get facultyId from req.query
  const facultyId = req.query.faculty;

  // Get user data from middleware
  const data = res.locals.data;

  // Check if user has permission to access API
  if (
    data.userInfo.FK_role_id &&
    data.userInfo.FK_role_id != _MANAGER_ROLE_ID &&
    data.userInfo.FK_faculty_id != facultyId
  ) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      messages: "Permission required",
    });
  }

  //  Get event info and its posted articles by eventId and facultyId
  const query = getPublishedEventOfFacultyId(facultyId);

  await query
    .then((result) => {
      console.log("result: ", result);

      res.status(200).json({
        status: res.statusCode,
        success: true,
        publishedEvents: result,
      });
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        status: res.statusCode,
        success: false,
        messages: "Bad request",
      });
    });
});

/**
 * @method GET
 * @api /api/events/:eventId
 * @permissions
 *      - Students (exact faculty)
 * @description API for getting event information for students
 * @params
 *      - eventId: Int (req.params)
 * @return
 *      - event: Object
 *          + ..................................
 * @notes
 *      - Need facultyName      ????
 */
router.get("/:eventId", gwAccountValidation, async (req, res) => {
  // Get user info from middleware
  const user = res.locals.data;

  console.log("user: ", user);

  // Initialize the constant variables
  const facultyId = user.userInfo.FK_faculty_id;
  const eventId = req.params.eventId;

  // Get event infomation (info only)
  const query = getEventById(eventId, facultyId);

  await query
    .then((result) => {
      console.log("result: ", result);

      res.status(200).json({
        status: res.statusCode,
        success: true,
        event: result[0], ///// Not sure if its work
      });
    })
    .catch((err) => {
      if (err) {
        console.log("Err: ", err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          messages: "Bad request",
        });
      } else {
        // If er == false => Event not found
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          messages: "Invalid request!",
        });
      }
    });
});

/**
 * @method GET
 * @api /api/events/:eventId/all
 * @permissions
 *      - Anyone with Greenwich Account
 * @description API for getting event information and its posted articles (news)
 * @params
 *      - eventId: Int (req.params)
 * @return
 *      - event: Object
 *          + .................................. ???
 *      - articles: Array[]
 *          + ........................... ???
 * @notes
 *      - Should check role Guest? Manager? Student? before query ????
 * 		- Get data in db table 'Posted_Article'
 */
router.get("/:eventId/all", gwAccountValidation, async (req, res) => {
  const eventId = req.params.eventId;

  // Get event info and its posted articles by eventId and facultyId
  const query = getPostedArticlesOfEvent(eventId);

  await query
    .then((result) => {
      console.log("result: ", result);

      res.status(200).json({
        status: res.statusCode,
        success: true,
        // Because event is only 1, so dont need to pass array to Frontend
        event: result[0][0],
        articles: result[1],
      });
    })
    .catch((err) => {
      if (err) {
        console.log("Err: ", err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          messages: "Bad request",
        });
      } else {
        // If err == false => Event not found
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          messages: "Invalid request",
        });
      }
    });
});

/**
 * @method GET
 * @api /api/events/:eventId/submitted-articles
 * @permissions
 *      - Coordinators (exact faculty)
 * @description API for getting new article submissions of a faculty
 * @params
 *      - eventId: Int (req.params)
 * @return
 *      - status: Int
 *      - success: Boolean,
 *      - submittedArticles: Array[Object]
 *          {
 *            - article_id: Int,
 *            - article_submission_date: Int(Timestamp),
 *            - article_status: String,
 *            - article_folderId: String,
 *            - FK_account_id: Int,
 *            - FK_event_id: Int,
 *            - files: [
 *                {
 *                  file_id: Int,
 *                  file_mimeType: String,
 *                   file_fileId: String,
 *                  FK_article_id: Int
 *                }
 *             ]
 *          }
 * @notes
 */

router.get(
  "/:eventId/submitted-articles",
  coordinatorValidation,
  async (req, res) => {
    // Get userInfo from middleware
    const data = res.locals.data;

    // Initialize constant variables
    const facultyId = data.userInfo.FK_faculty_id;
    const eventId = req.params.eventId;

    // Get event new submission
    const query = getSubmittedArticles(eventId, facultyId);

    await query
      .then((result) => {
        console.log("query result: ", result);

        // Create array to store final data to return to frontend
        let articlesResult = [];

        // Create array for storing distinc iterated article_id
        let passedArticlesId = [];

        // Create Object for storing the article's position in 'articlesResult[]' for searching optimization
        let articlesPositionDetail = {};

        // Itarate each data in result
        result.map((articleInfo) => {
          // Check if this article is exist in 'articlesResult' array or not
          if (passedArticlesId.includes(articleInfo.article_id)) {
            // If this article existed in 'articlesResult' array, push its file into 'article.files'

            // Get position of the article in 'articlesResult[]'
            let articlePosition =
              articlesPositionDetail[articleInfo.article_folderId];
            console.log("position: ", articlePosition);

            // Create file Object to store file information
            let file = {
              file_id: articleInfo.file_id,
              file_mimeType: articleInfo.file_mimeType,
              file_name: articleInfo.file_name,
              file_fileId: articleInfo.file_fileId,
              FK_article_id: articleInfo.FK_article_id,
            };

            // Insert file Object to its article in 'articlesResult[]'
            articlesResult[articlePosition].files.push(file);
          } else {
            // If this article not exist, push the article_id into 'passedArticlesId'
            passedArticlesId.push(articleInfo.article_id);

            // Create article Object to store information from result
            let article = {
              article_id: articleInfo.article_id,
              article_submission_date: articleInfo.article_submission_date,
              article_status: articleInfo.article_status,
              article_folderId: articleInfo.article_folderId,
              email: articleInfo.email,
              FK_faculty_id: articleInfo.FK_faculty_id,
              FK_account_id: articleInfo.FK_account_id,
              FK_event_id: articleInfo.FK_event_id,
              files: [],
            };

            // Create file Object to store file information
            let file = {
              file_id: articleInfo.file_id,
              file_mimeType: articleInfo.file_mimeType,
              file_name: articleInfo.file_name,
              file_fileId: articleInfo.file_fileId,
              FK_article_id: articleInfo.FK_article_id,
            };

            // Push file Object into 'article.files' (only in first-time run)
            article.files.push(file);

            // Finally, push article information into 'articlesResult[]'
            articlesResult.push(article);

            // Storing article position in Object (key: articleFolderId, value: position in 'articlesResult[]')
            articlesPositionDetail[articleInfo.article_folderId] =
              articlesResult.length - 1;
          }
        });

        // Finally, response the submittedArticles[]
        res.status(200).json({
          status: res.statusCode,
          success: true,
          submittedArticles: articlesResult,
        });
      })
      .catch((err) => {
        if (err) {
          console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            messages: "Bad request",
          });
        } else {
          // If err == false => Event not found
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            messages: "Event not found",
          });
        }
      });
  }
);

/**
 * @method GET
 * @api /api/events/:eventId/selected-articles
 * @permissions
 *      - Manager		???????
 *      - Coordinators (exact faculty)
 * @description API for getting selected articles
 * @params
 *      - eventId: Int (req.params)
 * @return
 *      - selectedArticles: Array[]
 *          + ........................... ???
 * @notes
 */
router.get(
  "/:eventId/selected-articles",
  coordinatorValidation,
  async (req, res) => {
    // Get middleware data
    const data = res.locals.data;

    // Initialize constant variables
    const facultyId = data.userInfo.FK_faculty_id;
    const eventId = req.params.eventId;

    // Get event selected submission
    const query = getSelectedArticles(eventId, facultyId);

    await query
      .then((result) => {
        console.log("result: ", result);

        // Create array to store final data to return to frontend
        let articlesResult = [];

        // Create array for storing distinc iterated article_id
        let passedArticlesId = [];

        // Create Object for storing the article's position in 'articlesResult[]' for searching optimization
        let articlesPositionDetail = {};

        // Itarate each data in result
        result.map((articleInfo) => {
          // Check if this article is exist in 'articlesResult' array or not
          if (passedArticlesId.includes(articleInfo.article_id)) {
            // If this article existed in 'articlesResult' array, push its file into 'article.files'

            // Get position of the article in 'articlesResult[]'
            let articlePosition =
              articlesPositionDetail[articleInfo.article_folderId];
            console.log("position: ", articlePosition);

            // Create file Object to store file information
            let file = {
              file_id: articleInfo.file_id,
              file_mimeType: articleInfo.file_mimeType,
              file_name: articleInfo.file_name,
              file_fileId: articleInfo.file_fileId,
              FK_article_id: articleInfo.FK_article_id,
            };

            // Insert file Object to its article in 'articlesResult[]'
            articlesResult[articlePosition].files.push(file);
          } else {
            // If this article not exist, push the article_id into 'passedArticlesId'
            passedArticlesId.push(articleInfo.article_id);

            // Create article Object to store information from result
            let article = {
              article_id: articleInfo.article_id,
              article_submission_date: articleInfo.article_submission_date,
              article_status: articleInfo.article_status,
              article_folderId: articleInfo.article_folderId,
              email: articleInfo.email,
              FK_faculty_id: articleInfo.FK_faculty_id,
              FK_account_id: articleInfo.FK_account_id,
              FK_event_id: articleInfo.FK_event_id,
              files: [],
            };

            // Create file Object to store file information
            let file = {
              file_id: articleInfo.file_id,
              file_mimeType: articleInfo.file_mimeType,
              file_name: articleInfo.file_name,
              file_fileId: articleInfo.file_fileId,
              FK_article_id: articleInfo.FK_article_id,
            };

            // Push file Object into 'article.files' (only in first-time run)
            article.files.push(file);

            // Finally, push article information into 'articlesResult[]'
            articlesResult.push(article);

            // Storing article position in Object (key: articleFolderId, value: position in 'articlesResult[]')
            articlesPositionDetail[articleInfo.article_folderId] =
              articlesResult.length - 1;
          }
        });

        // Finally, response the selectedArticles[]
        res.status(200).json({
          status: res.statusCode,
          success: true,
          selectedArticles: articlesResult,
        });
      })
      .catch((err) => {
        if (err) {
          console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            messages: "Bad request",
          });
        } else {
          // If err == false => Event not found
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            messages: "Event not found",
          });
        }
      });
  }
);

/**
 * @method GET
 * @api /api/events/:eventId/rejected-articles
 * @permissions
 *      - Manager			??????
 *      - Coordinators (exact faculty)
 * @description API for getting rejected articles
 * @params
 *      - eventId: Int (req.params)
 * @return
 *      - rejectedArticles: Array[]
 *          + ........................... ???
 * @notes
 */
router.get(
  "/:eventId/rejected-articles",
  coordinatorValidation,
  async (req, res) => {
    // Get middleware data
    const data = res.locals.data;
    console.log("data: ", data);

    // Get data from params & userInfo
    const facultyId = data.userInfo.FK_faculty_id;
    const eventId = req.params.eventId;

    // Get event rejected submission
    const query = getRejectedArticles(eventId, facultyId);

    await query
      .then((result) => {
        console.log("result: ", result);

        // Create array to store final data to return to frontend
        let articlesResult = [];

        // Create array for storing distinc iterated article_id
        let passedArticlesId = [];

        // Create Object for storing the article's position in 'articlesResult[]' for searching optimization
        let articlesPositionDetail = {};

        // Itarate each data in result
        result.map((articleInfo) => {
          // Check if this article is exist in 'articlesResult' array or not
          if (passedArticlesId.includes(articleInfo.article_id)) {
            // If this article existed in 'articlesResult' array, push its file into 'article.files'

            // Get position of the article in 'articlesResult[]'
            let articlePosition =
              articlesPositionDetail[articleInfo.article_folderId];
            console.log("position: ", articlePosition);

            // Create file Object to store file information
            let file = {
              file_id: articleInfo.file_id,
              file_mimeType: articleInfo.file_mimeType,
              file_name: articleInfo.file_name,
              file_fileId: articleInfo.file_fileId,
              FK_article_id: articleInfo.FK_article_id,
            };

            // Insert file Object to its article in 'articlesResult[]'
            articlesResult[articlePosition].files.push(file);
          } else {
            // If this article not exist, push the article_id into 'passedArticlesId'
            passedArticlesId.push(articleInfo.article_id);

            // Create article Object to store information from result
            let article = {
              article_id: articleInfo.article_id,
              article_submission_date: articleInfo.article_submission_date,
              article_status: articleInfo.article_status,
              article_folderId: articleInfo.article_folderId,
              email: articleInfo.email,
              FK_faculty_id: articleInfo.FK_faculty_id,
              FK_account_id: articleInfo.FK_account_id,
              FK_event_id: articleInfo.FK_event_id,
              files: [],
            };

            // Create file Object to store file information
            let file = {
              file_id: articleInfo.file_id,
              file_mimeType: articleInfo.file_mimeType,
              file_name: articleInfo.file_name,
              file_fileId: articleInfo.file_fileId,
              FK_article_id: articleInfo.FK_article_id,
            };

            // Push file Object into 'article.files' (only in first-time run)
            article.files.push(file);

            // Finally, push article information into 'articlesResult[]'
            articlesResult.push(article);

            // Storing article position in Object (key: articleFolderId, value: position in 'articlesResult[]')
            articlesPositionDetail[articleInfo.article_folderId] =
              articlesResult.length - 1;
          }
        });

        // Finally, response the rejectedArticles[]
        res.status(200).json({
          status: res.statusCode,
          success: true,
          rejectedArticles: articlesResult,
        });
      })
      .catch((err) => {
        res.status(501).json({
          status: res.statusCode,
          success: false,
          messages: "Bad request",
        });
      });
  }
);
// ==================================================================

/**
 * @method POST
 * @API /api/events/
 * @description API for creating new event
 * @params
 *      - title: String
 *      - content: String
 *      - imageData: file
 * 		  - startDate: Date (yyyy-mm-dd)
 *      - endDate: Date (yyyy-mm-dd)
 *      - lastUpdateDate (yyyy-mm-dd)
 *      - facultyId: Int
 * @return
 *
 * @notes
 *      - event image upload not implemented
 */
router.post("/", managerValidation, async (req, res) => {
  // Not sure if file is retrieved by req.files or req.body
  const { title, content, startDate, endDate, lastUpdateDate, facultyId } = req.body;

  // Get all coordinator accounts of a faculty
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
      // If database error, return 501 error
      if (!!err) {
        console.log("Err: ", err);
        return res.status(501).json({
          messages: "Bad request",
        });
      } else {
        // If no faculty found, return 404 error
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
    // const imageData = fs.readFileSync(req.file.path, "base64"
    // console.log("image base64 string :", imageBase64);
    **/

  // Input startDate processing (from date format to timestamps)
  let splittedStartDate = startDate.split("-");
  const newStartDate = new Date(
    splittedStartDate[0],
    splittedStartDate[1] - 1,
    splittedStartDate[2]
  ).getTime();
  console.log(newStartDate);

  // Input endDate processing (from date format to timestamps)
  let splittedEndDate = endDate.split("-");
  const newEndDate = new Date(
    splittedEndDate[0],
    splittedEndDate[1] - 1,
    splittedEndDate[2]
  ).getTime();
  console.log(newEndDate);

  // Get the current time
  const currentTime = new Date();

  // Create event object data to INSERT into database
  const eventData = {
    title: title,
    content: content,
    // Image data will be set (fileId) after upload image to drive
    imageData: "",
    startDate: newStartDate,
    endDate: newEndDate,
    createdAt: currentTime.getTime(),
    lastUpdate: lastUpdateDate,
    // folderId, selectedArticles and allArticles temporarily has default value and will be changed after create folders
    folderId: "",
    selectedArticles: eventSubFoldersConstant.acceptedArticles,
    allArticles: eventSubFoldersConstant.allArticles,
    FK_faculty_id: facultyId,
  };

  // Get the auth service
  const jwToken = await getAuthServiceJwt();

  // Create drive service
  const drive = google.drive({
    version: "v3",
    auth: jwToken,
  });

  console.log("faculty tra ve: ", facultyInfo);

  // The fileMetadata for event folder, with parent folder is folderId of its Faculty
  const eventFolderMetadata = {
    name: `${currentTime.toLocaleDateString()}: ${
      eventData.title
    } - ${currentTime.getTime()}`,
    mimeType: "application/vnd.google-apps.folder",
    parents: [facultyInfo.faculty_folderId],
  };

  // Default subfolder of Event folder (selected articles and all articles folders)
  const eventSubFolders = [
    {
      name: eventSubFoldersConstant.acceptedArticlesFolderName,
    },
    {
      name: eventSubFoldersConstant.allArticlesFolderName,
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

  // Create coordinators permission data
  let coordinatorPermissionsList = [];

  coordinatorAccounts.map((coordinator) => {
    coordinatorPermissionsList.push({
      kind: "drive#permission",
      type: "user",
      role: "writer",
      emailAddress: coordinator.email,
    });
  });

  // Create student permission data (???? needed or not?)
  // letstudentPermissions = [];

  // studentAccounts.map((student) => {
  // 	studentPermissions.push({
  // 		kind: 'drive#permission',
  // 		type: 'user',
  // 		role: 'writer',
  // 		emailAddress: student.email,
  // 	});
  // });

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

  // Create event folder
  createFolder(eventFolderMetadata)
    .then((eventFolderId) => {
      // Insert coordinator permission to event folder by id
      insertPermissionsToFolderId(coordinatorPermissionsList, eventFolderId);

      // Assign event folderId to eventData
      eventData.folderId = eventFolderId;

      // Create event sub-folders
      createSubFolders(eventSubFolders, eventSubFoldersConstant, eventFolderId)
        .then((subFoldersData) => {
          // Assign the subfolder's folderId returned from 1 to event Object
          eventData.selectedArticles = subFoldersData.acceptedArticlesId;
          eventData.allArticles = subFoldersData.allArticlesId;

          console.log("event data: ", eventData);

          const uploadMultiple = upload.any("file");

          // Insert event image into drive
          uploadMultiple(req, res, function (err) {
            if (err) throw err;
            console.log("files: ", req.files);

            // Get files[] from request
            const files = req.files;

            // Map all elements in files
            files.map((filedata) => {
              // Create metadata for file
              const filemetadata = {
                name: `${currentTime.getTime()} | ${eventData.title}`,
                parents: [eventImageFolderId],
              };

              // Create media type for file
              const media = {
                mimeType: filedata.mimetype,
                body: fs.createReadStream(filedata.path),
              };

              // Upload file to google drive
              drive.files.create(
                {
                  resource: filemetadata,
                  media: media,
                  fields: "id",
                },
                async (err, file) => {
                  if (err) {
                    res.json({
                      status: 501,
                      success: false,
                      message: "Upload files to drive failed!",
                    });
                    fs.unlinkSync(filedata.path);
                    return;
                  }

                  // STEP 8: Get the file id after uploaded successful
                  console.log("File id: ", file.data.id);

                  fs.unlinkSync(filedata.path);

                  eventData.imageData = file.data.id;

                  // Insert eventData into database
                  console.log("event: ", eventData);

                  createNewEvent(eventData)
                    .then((result) => {
                      console.log("Result: ", result);
                      return res.status(201).json({
                        status: res.statusCode,
                        success: true,
                        eventInfo: eventData,
                      });
                    })
                    .catch((err) => {
                      if (!!err) {
                        console.log(err);
                        return res.status(500).json({
                          status: res.statusCode,
                          success: false,
                          message: "Server error!",
                        });
                      } else {
                        // If err = false, return faculty not found error
                        return res.status(404).json({
                          status: res.statusCode,
                          success: false,
                          message: "Faculty not found!",
                        });
                      }
                    });
                }
              );
            });
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({
            status: res.statusCode,
            success: false,
            message: "Server error!",
          });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        status: res.statusCode,
        success: false,
        message: "Server error",
      });
    });
});

/**
 * @method PUT
 * @API /api/events/:eventId
 * @description API for updating event
 * @params
 *      - title: String
 *      - content: String
 *      - imageData: file
 *      - endDate: Date (yyyy-mm-dd)
 *      - folderId: String (???? needed?)
 *      - facultyId: Int
 * @return
 *      - status: Int
 *      - success: Boolean
 *      - message: String
 *      - userInfo: Object
 *          + username: String
 *          + role_name: String
 * @notes
 *      - Image data not implemented
 *      - Startdate needed?
 */
router.put(
  "/:eventId",
  managerValidation,
  upload.single("file"),
  (req, res) => {
    const {
      title,
      content,
      // imageData,
      startDate,
      endDate,
      folderId,
      FK_faculty_id,
    } = req.body;

    const { eventId } = req.params;

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

    // Input startDate and endDate processing (from yyyy-mm-dd to timestamps)
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

    // Get current time constants and create data Object
    const currentTime = new Date();
    const data = {
      eventId: eventId,
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

    // Update event by passing data Object
    updateEvent(data)
      .then((result) => {
        return res.status(200).json({
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
          // If err = false return eventId not found
          return res.status(404).json({
            success: false,
            message: "Not found!",
          });
        }
      });
  }
);

/**
 * @method PATCH
 * @API /api/events/:eventId/publish
 * @description API for publish event
 * @params
 *      - eventId: Int
 * @return null
 * @notes
 */
router.patch("/:eventId/publish", managerValidation, (req, res) => {
  const { eventId } = req.params;

  // Publish event by eventId
  const query = publishEventById(eventId);
  query
    .then((result) => {
      return res.status(202).json({
        success: true,
        message: `Event ${result.event_title} published successfully`,
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
        // If err == false, return event not found
        return res.status(404).json({
          success: false,
          message: "Invalid request!",
        });
      }
    });
});

/**
 * @method DELETE
 * @API /api/events/:eventId
 * @description API for deleting event
 * @params
 *      - eventId: Int
 * @return null
 * @notes
 *      - Delete event on drive??? Or not??
 */
router.delete("/:eventId", managerValidation, (req, res) => {
  const { eventId } = req.params;

  // Delete event by eventId
  const query = deleteEventById(eventId);
  query
    .then((result) => {
      return res.status(202).json({
        success: true,
        message: `Event ${result.event_title} deleted successfully`,
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
        // If err = false, return event not found
        return res.status(404).json({
          success: false,
          message: "Event not found!",
        });
      }
    });
});

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
