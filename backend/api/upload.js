require("dotenv").config();

const express = require("express");
const router = express.Router();
const fs = require("fs");
const webToken = require("jsonwebtoken");
const async = require("async");
const { google, Auth } = require("googleapis");

// Import modules from other files
const { getAuthClient, getUserProfile } = require("../utils/auth");
const { gwAccountValidation } = require("./middleware/verification");
const { getAuthServiceJwt } = require("../utils/driveAPI");
const { getEventById } = require("../utils/dbService/eventService");
const { upload } = require("../utils/multerStorage");
const SERVICE_KEY = require("../private_key.json");

const STUDENT_ROLE_ID = 1;

/** 
 * @method POST
 * @description API for upload article submissions for students
 * @params 
 *      - eventId: Int
 *      - title: Int
 *      - content: Boolean
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
router.post("/", gwAccountValidation, async (req, res) => {
  // Get params from request body
  const { eventId } = req.body;

  let eventInfo = undefined;

  // STEP 1: Get user info passed from middleware
  const data = res.locals.data;

  // STEP 2: Check if user role is Student or not
  if (data.userInfo.FK_role_id != STUDENT_ROLE_ID) {
    res.status(401).json({
      status: res.statusCode,
      success: false,
      message: "Student permission required.",
    });
  }

  // Check if student faculty is correct or not?????

  // STEP 3: If student and event are correct, assign data to studentInfo
  const studentInfo = data;

  // STEP 4: Get the event information and check if the student faculty is correct or not
  const query = getEventById(eventId);

  await query
    .then((result) => {
      eventInfo = result[0];
      if (eventInfo.FK_faculty_id != data.userInfo.FK_faculty_id) {
        res.status(401).json({
          success: false,
          message:
            "You don't have submitting permission to this event's faculty",
        });
      }
    })
    .catch((err) => {
      if (!!err) {
        console.log("Err: ", err);
        return res.status(501).json({
          messages: "Bad request",
        });
      } else {
        // If no event found
        console.log("Err: ", err);
        return res.status(404).json({
          messages: "Event not found",
        });
      }
    });

  // DISPLAY THE DATA TO TEST
  console.log("Student information: ", studentInfo);
  console.log("Event information: ", eventInfo);

  // STEP 5: Get the drive auth service
  const jwToken = await getAuthServiceJwt();
  const drive = google.drive({
    version: "v3",
    auth: jwToken,
  });

  // STEP 6: Create a folder to store student articles
  const currentTime = new Date();

  const studentFolderMetadata = {
    name: `${studentInfo.email} | ${currentTime.getTime()}`,
    mimeType: "application/vnd.google-apps.folder",
    parents: [eventInfo.folderId_allArticles],
  };
  let studentFolderId = undefined;

  await drive.files.create(
    {
      resource: studentFolderMetadata,
      fields: "id",
    },
    (err, file) => {
      if (err) {
        console.error(err);
        res.status(501).json({
          status: res.statusCode,
          success: false,
          message: "Failed to upload files to the server!"
        })
      } else {
        console.log("Student folder Id: ", file.data.id);
        studentFolderId = file.data.id;
      }
    }
  );

  // STEP 7: Upload files into student's folder above
  const uploadMultiple = upload.any("uploadedImages");

  uploadMultiple(req, res, function (err) {
    if (err) throw err;
    console.log("files: ", req.files);

    // For testing
    // const folderId = "1FC5OAoz8bud4TGCjjaEyIzwJvJE4nSHY";

    const files = req.files;

    files.map((filedata) => {
      const filemetadata = {
        name: filedata.filename,
        parents: [studentFolderId],
      };

      const media = {
        mimeType: filedata.mimetype,
        body: fs.createReadStream(filedata.path),
      };

      drive.files.create(
        {
          resource: filemetadata,
          media: media,
          fields: "id",
        },
        (err, file) => {
          if (err) {
            res.json({
              status: 501,
              success: false,
              message: "Upload files to drive failed!",
            });
            fs.unlinkSync(filedata.path);
          }
          // STEP 8: Get the file id and insert into database
          console.log("File id: ", file.data.id);


          // Delete the file in temp folder
          fs.unlinkSync(filedata.path);
        }
      );
    });
  });
});

module.exports = router;
