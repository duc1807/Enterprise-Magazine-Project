const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const async = require("async");
const schedule = require("node-schedule");

const app = express();

// Parse application/x-www-form-urlencoded
app
  .use(
    bodyParser.urlencoded({
      extended: true,
    })
  )
  // Allow cookie
  .use(cookieParser());

// Parse application/json
app.use(bodyParser.json());

// API controllers
app
  // Login validation API for student and staff (Google Auth)
  .use("/api/authentication", require("./api/authAPI/googleAuth"))

  // Authentication API for admin
  .use("/api/authentication/admin", require("./api/authAPI/admin"))

  // Authentication API for guest
  .use("/api/authentication/guest", require("./api/authAPI/guest"))

  // Faculty API
  .use("/api/faculties", require("./api/faculty"))

  // Event API (Event: Drive folder inside Faculty)
  .use("/api/events", require("./api/event"))

  // API for articles manipulating
  .use("/api/article", require("./api/article"))

  // Download API to get articles
  .use("/api/download", require("./api/download"))

  // Image display API
  .use("/api/image", require("./api/image"))

  // API for student to upload articles
  .use("/api/upload", require("./api/upload"))

  // API for manager to view the statistics
  .use("/api/statistics", require("./api/statistic"))

  // API for admin role
  .use("/api/admin/", require("./api/admin"))

  // API for get self-information
  .use("/api/account/", require("./api/account"));

// Serve static index.html file
app.use(express.static("dist/project"));

app.get("*", (req, res) => {
  res.setHeader(
    "X-Content-Type-Options",
    "nosniff",
    "X-XSS-Protection",
    "1;mode=block"
  );
  res.sendFile(path.join(__dirname, "dist/project/index.html"));
});

// Create new schedule for the system to auto create new year folder on drive
// The schedule will run on 1/1 each year (1:00 am)

// Import db update faculty FolderId service after create new year folder
const { createFolder, createFacultiesFolders } = require("./utils/driveAPI");
const { sendWarningMailToMultipleAccounts } = require("./utils/mailer");
const {
  getDataBaseConnection,
} = require("./utils/dbService/connection/dbConnection");
const {
  getAllFaculty,
  updateFacultyFolderId,
  getAccountsByRole,
} = require("./utils/dbService/index");
const GW_DRIVE_STORAGE_ID = "1QcjMbbouMx857IWLYYP23N6Iih_ezXIs";
const MANAGER_ROLE_ID = 3;

// Function to notice all managers if new semester folder is error when creating
const noticeErrorToManager = () => {
  const db = getDataBaseConnection();

  const sql = `SELECT * FROM Account
              WHERE FK_role_id = ${MANAGER_ROLE_ID}`;

  db.query(sql, (err, result) => {
    if (!!err) reject(err);
    // After getting all manager accounts, sendMail to all
    sendWarningMailToMultipleAccounts(result, currentYear, GW_DRIVE_STORAGE_ID);
  });
};

// Get current year
const currentYear = new Date().getFullYear();

// Test: 50 15 13 30 3 *
// Create schedule for the system to run on first day of each year
schedule.scheduleJob("0 0 1 1 1 *", async () => {
  // Get all faculty in database
  const faculties = await getAllFaculty().catch((err) => {
    console.log(err);
    noticeErrorToManager();
  });

  // Initialize Object and Array of faculties
  const facultiesFolderConstants = {};
  const facultiesFoldersName = [];

  // Insert value from db result to Object and Array faculties
  faculties.map((faculty) => {
    facultiesFolderConstants[`faculty${faculty.faculty_name}`] =
      faculty.faculty_name;
    facultiesFoldersName.push({
      name: faculty.faculty_name,
    });
  });

  // Create new year folder metadata
  const folderMetadata = {
    name: `${currentYear}`,
    mimeType: "application/vnd.google-apps.folder",
    parents: [GW_DRIVE_STORAGE_ID],
  };

  console.log(facultiesFolderConstants);
  console.log(facultiesFoldersName);

  // Create new year folder on Drive
  createFolder(folderMetadata)
    .then((parentFolderId) => {
      // Create new faculties folder on Drive
      createFacultiesFolders(
        facultiesFoldersName,
        facultiesFolderConstants,
        parentFolderId
      )
        .then((facultiesFolderId) => {
          console.log("Create faculties: ", facultiesFolderId);
          // Create array to store faculties information to update into database
          let facultiesInfo = [];

          // Check to push correct folderId to its correct faculty
          for (const facultyName in facultiesFolderConstants) {
            facultiesInfo.push({
              facultyName: facultiesFolderConstants[facultyName],
              folderId: facultiesFolderId[facultyName],
            });
          }
          // Update folderId of faculties in database
          updateFacultyFolderId(facultiesInfo)
            .then((result) => {
              console.log(`New ${currentYear} semester started!`);
            })
            .catch((err) => {
              noticeErrorToManager();
            });
        })
        .catch((err) => {
          noticeErrorToManager();
        });
    })
    .catch((err) => {
      console.log("Event folder creating error: ", err);
      noticeErrorToManager();
    });
});

app.listen(5000, () => {
  console.log("App started on port 5000");
});
