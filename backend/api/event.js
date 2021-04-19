require("dotenv").config();

const express = require("express");
const router = express.Router();
const async = require("async");
const { google } = require("googleapis");

// Import modules & utils
const { getAuthClient } = require("../utils/auth");
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
  getPostedArticlesOfPublishedEvent,
} = require("../utils/dbService/index");

// Import middleware validation
const {
  managerValidation,
  gwAccountValidation,
  coordinatorValidation,
  accessValidation,
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
const EVENT_IMAGE_STORAGE = "1kTKaOhoyN172JorgjZ7rf6RC5deWNNhL";
const eventSubFoldersConstant = {
  acceptedArticlesFolderName: "Selected Articles",
  allArticlesFolderName: "All Articles",
};
const _MANAGER_ROLE_ID = 3;
const _STAFF_ROLE_ID = [2, 3];
const _GUEST_ROLE_NAME = "guest";

/**
 * @method GET
 * @api /api/events/published?facultyId=(facultyId)
 * @permissions
 *      - Anyone (with account)
 * @description API for getting published event information
 * @params
 *      - eventId: Int (req.params)
 * @return
 *      - events: Array[]
 *          + .................................. ???
 */
router.get("/published", gwAccountValidation, async (req, res) => {
  // Get facultyId from req.query
  const facultyId = req.query.facultyId;

  // Get user data from middleware
  const data = res.locals.data;

  // Check if user has permission to access API
  if (
    (data.userInfo.FK_role_id &&
      data.userInfo.FK_role_id != _MANAGER_ROLE_ID &&
      data.userInfo.FK_faculty_id != facultyId) ||
    (data.userInfo.role_name == _GUEST_ROLE_NAME &&
      data.userInfo.faculty_id != facultyId)
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
      res.status(200).json({
        status: res.statusCode,
        success: true,
        publishedEvents: result,
      });
    })
    .catch((err) => {
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
 */
router.get("/:eventId", gwAccountValidation, async (req, res) => {
  // Get user info from middleware
  const user = res.locals.data;

  // Initialize the constant variables
  const facultyId = user.userInfo.FK_faculty_id;
  const eventId = req.params.eventId;

  // Get event infomation (info only)
  const query = getEventById(eventId, facultyId);

  await query
    .then((result) => {
      res.status(200).json({
        status: res.statusCode,
        success: true,
        event: result[0],
      });
    })
    .catch((err) => {
      if (err) {
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
 */
router.get("/:eventId/all", gwAccountValidation, async (req, res) => {
  const eventId = req.params.eventId;

  let query = undefined;

  // Get event info and its posted articles by eventId and facultyId
  const data = res.locals.data;

  // Check if user is manager and coordinator or not
  if (!_STAFF_ROLE_ID.includes(data.userInfo.role_id)) {
    query = getPostedArticlesOfPublishedEvent(eventId);
  } else {
    query = getPostedArticlesOfEvent(eventId);
  }

  await query
    .then((result) => {
      res.status(200).json({
        status: res.statusCode,
        success: true,
        event: result.eventInfo,
        articles: result.postedArticles,
      });
    })
    .catch((err) => {
      if (err) {
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
              firstName: articleInfo.first_name || "",
              surName: articleInfo.sur_name || "",
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
 *      - Manager
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
              firstName: articleInfo.first_name || "",
              surName: articleInfo.sur_name || "",
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
 *      - Manager
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

    // Get data from params & userInfo
    const facultyId = data.userInfo.FK_faculty_id;
    const eventId = req.params.eventId;

    // Get event rejected submission
    const query = getRejectedArticles(eventId, facultyId);

    await query
      .then((result) => {
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
              firstName: articleInfo.first_name || "",
              surName: articleInfo.sur_name || "",
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
router.post("/", managerValidation, upload.any("file"), async (req, res) => {
  // Not sure if file is retrieved by req.files or req.body
  const {
    title,
    content,
    startDate,
    endDate,
    lastUpdateDate,
    facultyId,
  } = JSON.parse(req.body.newEvent);

  // Get all coordinator accounts of a faculty
  const query = getCoordinatorAccountsByFaculty(facultyId);
  let coordinatorAccounts = [];

  await query
    .then((result) => {
      coordinatorAccounts = result;
    })
    .catch((err) => {
      return res.status(501).json({
        status: res.statusCode,
        success: false,
        messages: "Bad request",
      });
    });

  // Get faculty information
  const query1 = getFacultyById(facultyId);
  let facultyInfo = [];

  await query1
    .then((result) => {
      facultyInfo = result[0];
    })
    .catch((err) => {
      // If database error, return 501 error
      if (!!err) {
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          messages: "Bad request",
        });
      } else {
        // If no faculty found, return 404 error
        return res.status(404).json({
          status: res.statusCode,
          success: false,
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
      studentAccounts = result;
    })
    .catch((err) => {
      return res.status(501).json({
        status: res.statusCode,
        success: false,
        messages: "Bad request",
      });
    });

  // Input startDate processing (from date format to timestamps)
  let splittedStartDate = startDate.split("-");
  const newStartDate = new Date(
    splittedStartDate[0],
    splittedStartDate[1] - 1,
    splittedStartDate[2]
  ).getTime();

  // Input endDate processing (from date format to timestamps)
  let splittedEndDate = endDate.split("-");
  const newEndDate = new Date(
    splittedEndDate[0],
    splittedEndDate[1] - 1,
    splittedEndDate[2]
  ).getTime();

  // Input endDate processing (from date format to timestamps)
  let splittedLastUpdateDate = lastUpdateDate.split("-");
  const newLastUpdateDate = new Date(
    splittedLastUpdateDate[0],
    splittedLastUpdateDate[1] - 1,
    splittedLastUpdateDate[2]
  ).getTime();

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
    lastUpdate: newLastUpdateDate,
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

  // Create coordinators permission data
  const coordinatorPermissions = coordinatorAccounts.map((coordinator) => ({
    kind: "drive#permission",
    type: "user",
    role: "writer",
    emailAddress: coordinator.email,
  }));

  // Create event folder
  createFolder(eventFolderMetadata)
    .then((eventFolderId) => {
      // Insert coordinator permission to event folder by id
      insertPermissionsToFolderId(coordinatorPermissions, eventFolderId);

      // Assign event folderId to eventData
      eventData.folderId = eventFolderId;

      // Create event sub-folders
      createSubFolders(eventSubFolders, eventSubFoldersConstant, eventFolderId)
        .then((subFoldersData) => {
          // Assign the subfolder's folderId returned from 1 to event Object
          eventData.selectedArticles = subFoldersData.acceptedArticlesId;
          eventData.allArticles = subFoldersData.allArticlesId;

          // Get files[] from request
          const files = req.files;

          // Map all elements in files
          files.map((filedata) => {
            // Create metadata for file
            const filemetadata = {
              name: `${currentTime.getTime()} | ${eventData.title}`,
              parents: [EVENT_IMAGE_STORAGE],
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
                fs.unlinkSync(filedata.path);

                eventData.imageData = file.data.id;

                // Insert eventData into database
                createNewEvent(eventData)
                  .then((result) => {
                    return res.status(201).json({
                      status: res.statusCode,
                      success: true,
                      eventInfo: eventData,
                    });
                  })
                  .catch((err) => {
                    if (!!err) {
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
        })
        .catch((err) => {
          return res.status(500).json({
            status: res.statusCode,
            success: false,
            message: "Server error!",
          });
        });
    })
    .catch((err) => {
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
 *      - lastUpdateDate: Date (yyyy-mm-dd)
 *      - folderId: String (???? needed?)
 *      - facultyId: Int
 * @return
 *      - status: Int
 *      - success: Boolean
 *      - message: String
 *      - userInfo: Object
 *          + username: String
 *          + role_name: String
 */
router.put("/:eventId", managerValidation, upload.any("file"), (req, res) => {
  const {
    title,
    content,
    endDate,
    lastUpdateDate,
    folderId,
    facultyId,
  } = req.body;

  const { eventId } = req.params;

  let splittedEndDate = endDate.split("-");
  const newEndDate = new Date(
    splittedEndDate[0],
    splittedEndDate[1] - 1,
    splittedEndDate[2]
  ).getTime();

  // Input endDate processing (from date format to timestamps)
  let splittedLastUpdateDate = lastUpdateDate.split("-");
  const newLastUpdateDate = new Date(
    splittedLastUpdateDate[0],
    splittedLastUpdateDate[1] - 1,
    splittedLastUpdateDate[2]
  ).getTime();

  // Get current time constants and create data Object
  const currentTime = new Date();
  const eventData = {
    eventId: eventId,
    title: title,
    content: content,
    imageData: "",
    endDate: newEndDate,
    lastUpdate: newLastUpdateDate,
    // folderId,
    facultyId: facultyId,
  };

  // Insert event image into drive
  // Get files[] from request
  const files = req.files;

  // Check if image is updated or not
  if (files && files.length) {
    // Map all elements in files
    files.map((filedata) => {
      // Create metadata for file
      const filemetadata = {
        name: `${currentTime.getTime()} | ${eventData.title}`,
        parents: [EVENT_IMAGE_STORAGE],
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
          fs.unlinkSync(filedata.path);

          eventData.imageData = file.data.id;

          // Update eventData into database
          updateEvent(eventData)
            .then((result) => {
              return res.status(200).json({
                status: res.statusCode,
                success: true,
                message: `Event ${title} updated successfully.`,
              });
            })
            .catch((err) => {
              if (!!err) {
                return res.status(500).json({
                  status: res.statusCode,
                  success: false,
                  message: "Server error!",
                });
              } else {
                // If err = false return eventId not found
                return res.status(404).json({
                  status: res.statusCode,
                  success: false,
                  message: "Not found!",
                });
              }
            });
        }
      );
    });
  } else {
    // If no image uploaded
    // Update eventData into database with imageData = ""
    updateEvent(eventData)
      .then((result) => {
        return res.status(200).json({
          status: res.statusCode,
          success: true,
          message: `Event ${title} updated successfully.`,
        });
      })
      .catch((err) => {
        if (!!err) {
          return res.status(500).json({
            status: res.statusCode,
            success: false,
            message: "Server error!",
          });
        } else {
          // If err = false return eventId not found
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            message: "Not found!",
          });
        }
      });
  }
});

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
        status: res.statusCode,
        success: true,
        message: `Event ${result.event_title} published successfully`,
      });
    })
    .catch((err) => {
      if (!!err) {
        return res.status(500).json({
          status: res.statusCode,
          success: false,
          message: "Server error!",
        });
      } else {
        // If err == false, return event not found
        return res.status(404).json({
          status: res.statusCode,
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
 */
router.delete("/:eventId", managerValidation, (req, res) => {
  const { eventId } = req.params;

  // Delete event by eventId
  const query = deleteEventById(eventId);
  query
    .then((result) => {
      return res.status(202).json({
        status: res.statusCode,
        success: true,
        message: `Event ${result.event_title} deleted successfully`,
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
        // If err = false, return event not found
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          message: "Event not found!",
        });
      }
    });
});

module.exports = router;
