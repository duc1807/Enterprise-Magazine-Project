require("dotenv").config();

const express = require("express");
const router = express.Router();
const fs = require("fs");
const async = require("async");
const { google, Auth } = require("googleapis");

// Import modules from other files
const { gwAccountValidation } = require("./middleware/verification");
const {
  getAuthServiceJwt,
  insertPermissionsToFolderId,
} = require("../utils/driveAPI");
const {
  getEventById,
  uploadFile,
  createNewArticle,
  getCoordinatorAccountsByFaculty,
} = require("../utils/dbService/index");
const { sendMail } = require("../utils/mailer");
const { upload } = require("../utils/multerStorage");

const STUDENT_ROLE_ID = 1;

/**
 * @method POST
 * @api api/upload/:eventId
 * @description API for upload article submissions for students
 * @params
 *      - eventId: Int
 *      - files: Array[]
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
 *      - Complexity on uploadMultiple function
 */
router.post(
  "/:eventId",
  gwAccountValidation,
  upload.any("uploadedImages"),
  async (req, res) => {
    // Get eventId from request body
    const { eventId } = req.params;

    // Get article information from req.body
    const { title, content, author } = JSON.parse(req.body.newArticle);

    // Create eventInfo variable
    let eventInfo = undefined;
    // Create filesArray[] to store files information
    let filesArray = [];

    // Create articleInfo Object to store article information
    const articleInfo = {
      articleSubmissionDate: undefined,
      articleFolderId: "",
      FK_account_id: undefined,
      FK_event_id: undefined,
      title: title,
      content: content,
      author: author,
    };

    // STEP 1: Get student info passed from middleware
    const data = res.locals.data;

    // STEP 2: Check if user role is Student or not
    if (data.userInfo.FK_role_id != STUDENT_ROLE_ID) {
      res.status(401).json({
        status: res.statusCode,
        success: false,
        message: "Student permission required.",
      });
    }

    // STEP 3: If student and event are correct, assign data to studentInfo
    const studentInfo = data;

    // Get facultyId from userInfo
    const facultyId = studentInfo.userInfo.FK_faculty_id;

    // STEP 4: Get the event information and check if the student faculty is correct or not
    const query = getEventById(eventId, facultyId);

    await query
      .then((result) => {
        // Assign query result to eventInfo
        eventInfo = result[0];

        // Check if student have permission to submit to the event
        if (eventInfo.FK_faculty_id != studentInfo.userInfo.FK_faculty_id) {
          res.status(401).json({
            status: res.statusCode,
            success: false,
            message: "You don't have submit permission to this event's faculty",
          });
        }
      })
      .catch((err) => {
        if (!!err) {
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            messages: "Bad request",
          });
        } else {
          // If no event found
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            messages: "Event not found",
          });
        }
      });

    // Function to send noti mail to coordinators of exact faculty
    const sendNotificationMailToCoordinator = async (
      studentEmail,
      eventInfo
    ) => {
      getCoordinatorAccountsByFaculty(facultyId).then((coordinatorAccounts) => {
        let coordinatorEmails = [];

        coordinatorAccounts.forEach((coordinatorAccount) => {
          coordinatorEmails.push(coordinatorAccount.email);
        });

        sendMail(coordinatorEmails, studentEmail, eventInfo);
      });
    };

    // STEP 5: Get the drive auth service
    const jwToken = await getAuthServiceJwt();
    const drive = google.drive({
      version: "v3",
      auth: jwToken,
    });

    // STEP 6: Create a folder to store student articles and upload to database
    const studentFolderMetadata = {
      name: `${studentInfo.userInfo.email} | ${new Date().getTime()}`,
      mimeType: "application/vnd.google-apps.folder",
      parents: [eventInfo.folderId_allArticles],
    };

    await drive.files.create(
      {
        resource: studentFolderMetadata,
        fields: "id",
      },
      async (err, file) => {
        if (err) {
          res.status(501).json({
            status: res.statusCode,
            success: false,
            message: "Failed to upload files to the server!",
          });
        } else {
          // Create permission information for current student
          const studentPermissionList = [
            {
              kind: "drive#permission",
              type: "user",
              role: "writer",
              emailAddress: studentInfo.userInfo.email,
            },
          ];

          // Insert student permission to student's article folder
          insertPermissionsToFolderId(
            studentPermissionList,
            file.data.id
          ).catch((err) => {
            console.log(
              "Error when addding student permission to submitted article folder"
            );
          });

          // Insert data to articleInfo Object and INSERT into database
          articleInfo.articleSubmissionDate = new Date().getTime();
          articleInfo.articleFolderId = file.data.id;
          articleInfo.FK_account_id = studentInfo.userInfo.account_id;
          articleInfo.FK_event_id = eventInfo.event_id;

          const query1 = createNewArticle(articleInfo);

          await query1.then(async (result) => {
            // Get files[] from request
            const files = req.files;

            // Map all elements in files
            files.map((filedata, index) => {
              // Create metadata for file
              const filemetadata = {
                name: filedata.filename,
                parents: [articleInfo.articleFolderId],
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
                  // Create file info Object to INSERT into database
                  const fileInfo = {
                    mimeType: filedata.mimetype,
                    fileName: filedata.originalname,
                    fileId: file.data.id,
                    FK_article_id: result.insertId,
                  };

                  // Push files into filesArray[]
                  filesArray.push(fileInfo);
                  // Check if all files have been pushed into filesArray[]
                  // If true, get all the files and comments of current article and return

                  if (filesArray.length == files.length) {
                    // INSERT new file into database 'File'
                    const query2 = uploadFile(filesArray);

                    await query2
                      .then(async (result2) => {
                        console.log(
                          filedata.filename + " uploaded successfully"
                        );

                        // Check if the last file is INSERT into database or not
                        // If all file inserted, return article's files list
                        if (index == files.length - 1) {
                          // Get all files and comments of current article
                          sendNotificationMailToCoordinator(
                            studentInfo.userInfo.email,
                            eventInfo
                          );

                          return res.status(201).json({
                            status: res.statusCode,
                            success: true,
                            message: "Upload successful",
                          });
                        }
                      })
                      .catch((err) => {
                        return res.status(500).json({
                          status: res.statusCode,
                          success: false,
                          message: "Error when uploading files",
                        });
                      });
                  }
                  // Delete the file in temp folder
                  fs.unlinkSync(filedata.path);
                }
              );
            });
          });
        }
      }
    );
  }
);

module.exports = router;
