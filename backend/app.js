const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const csrf = require("csurf");
var cors = require("cors");
const async = require("async");
const schedule = require("node-schedule");

const app = express();

// Set the view engine to ejs
app.set("view engine", "ejs");

// allow cross-origin resource sharing (temporally)
const corsOptions = {
  credentials: true,
  origin: "*",
  ///..other options
};

app.use(cors(corsOptions));

// Parse application/x-www-form-urlencoded
app
  .use(
    bodyParser.urlencoded({
      extended: true,
    })
  )
  // Allow cookie
  .use(cookieParser());

// app.use(csrf({ cookie: true }));

// Parse application/json
app.use(bodyParser.json());

// =================================== TEST
app.get("/testUpload", (req, res) => {
  res.render("success", { name: "test", pic: "hi", success: true });
});

// API controllers
app
  // Login validation API for student and staff (Google Auth)
  .use("/api/authentication", require("./api/authAPI/googleAuth"))

  // Authentication API for admin
  .use("/api/authentication/admin", require("./api/authAPI/admin"))

  // Authentication API for guest
  .use("/api/authentication/guest", require("./api/authAPI/guest"))

  // .use(csrf({ cookie: true }))

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
  .use("/api/account/", require("./api/account"))

  // ============================================================== In development
  .use("/api/user", require("./api/user"))
  .use("/api/notification", require("./api/mailnotification"));

// .use("/api/student", require("./api/Authentication/student"));

// Serve static index.html file

// app.use(express.static("dist/project"))

// app.get("*", (req, res) => {
//   res.cookie('XSRF-TOKEN', req.csrfToken())
//   res.sendFile(path.join(__dirname, "dist/project/index.html"));
// });

// ====================================================== Test
app.get("/google", (req, res) => {
  res.render("index", {
    clientID:
      "701728448437-q5cultsjtf3hj42dbehh6dvfg15e9k3e.apps.googleusercontent.com",
  });
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

// 50 15 13 30 3 *
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
          console.log("Final data: ", facultiesInfo);
          // Update folderId in database

          // Update folderId of faculties in database
          updateFacultyFolderId(facultiesInfo)
            .then((result) => {
              console.log(`New ${currentYear} semester started!`);
            })
            .catch((err) => {
              console.log("Err");
              noticeErrorToManager();
            });
        })
        .catch((err) => {
          console.log("Faculties folder creating error: ", err);
          noticeErrorToManager();
        });
    })
    .catch((err) => {
      console.log("Event folder creating error: ", err);
      noticeErrorToManager();
    });
  // ============================================ New ways to create folders
});

app.listen(5000, () => {
  console.log("App started on port 5000");
});

// ============================================ OLD CODE

// var Storage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, "./temp");
//   },
//   filename: function (req, file, callback) {
//     callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
//   },
// });

// var upload = multer({
//   storage: Storage,
// }).single("file"); //Field name and max count

// var upload = multer({
//   storage: Storage,
// }).any('uploadedImages')

// app.get("/", async(req, res) => {
//   let test = getAuthClient()
//   console.log("test: ", Boolean(Object.keys(test.credentials).length))
//   let status = loginStatus();
//   if (!status) {
//     var url = getAuthUrl();
//     console.log(url);

//     res.render("index", { url: url, clientID: CLIENT_ID });
//   } else {
//     let oAuth2Client = getAuthClient();

//     var oauth2 = google.oauth2({
//       auth: oAuth2Client,
//       version: "v2",
//     });
//     const data = await oauth2.tokeninfo()
//     const token = data.config.headers.Authorization.split(' ')[1]
//     const tokenInfo = await oAuth2Client.credentials

//     console.log("TOKENNNNN : ", tokenInfo)
//     const token_old = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZkYjQwZTJmOTM1M2M1OGFkZDY0OGI2MzYzNGU1YmJmNjNlNGY1MDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3MDE3Mjg0NDg0MzctcTVjdWx0c2p0ZjNoajQyZGJlaGg2ZHZmZzE1ZTlrM2UuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3MDE3Mjg0NDg0MzctcTVjdWx0c2p0ZjNoajQyZGJlaGg2ZHZmZzE1ZTlrM2UuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTI2MDY3NTk4MzA4NTQxMTkwMjQiLCJhdF9oYXNoIjoiWnFXRmNJWTVCX2M2VjVhTFduemprZyIsIm5hbWUiOiJEdWMgRHVjIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tQk12MGRta3FNQVUvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQU1adXVjbmxNbVJlVGx0RmFqcFBqYldnY2l2LTZ3bXI1QS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiRHVjIiwiZmFtaWx5X25hbWUiOiJEdWMiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTYxMzgzODQyMSwiZXhwIjoxNjEzODQyMDIxfQ.PcSMjdVAsoN6cYmQpV9O1Mt9QA7eWJ4-H3drBurpMt5K1_H3W7jIEVbXK5OC1dyF11iHTQ-jytrkpbh3tLhyiTiYihw82FYT4NROaT4gLMgMN7Nke4fmSJIP8hvpfceeHHnNgsORoesNVTvgLTT0-oeYvArBvhbIYIcy1J0lIZt6txWdQghMX50KFRtVrbfPlhu88Dt0yOUfA_EkQqnyRXPQLJVseR8H3fK5ub2PHaXCdbLoaAywJYeqDzznelSy-TBiRD4bimbBmDajtRqQFztXTjPogT0hr4zjxIvNrEngehTydTmwQ5Mw28UqlVxnG_0X7vLJBRYNmvaxMC7igA"
//     // await oAuth2Client.revokeToken(token_old).then(console.log("ok go token"))

//     async function verify() {
//       const ticket = await oAuth2Client.verifyIdToken({
//         idToken: tokenInfo.id_token,
//         audience: CLIENT_ID,
//       });

//       const payload = ticket.getPayload();
//       const userid = payload["sub"];

//       console.log("userid: ", payload)
//     }

//     verify().then(console.log("token con hieu luc")).catch(console.log("da go token"))

//     // user info

//     oauth2.userinfo.get((err, response) => {
//       if (err) throw err;

//       console.log(response.data);

//       name = response.data.name;
//       pic = response.data.picture;

//       res.render("success", { name: name, pic: pic, success: false });
//     });
//   }
// });

// app.get("/google/callback", (req, res) => {
//   const code = req.query.code;

//   if (code) {
//     console.log("codee: ", code);
//     // get access token
//     let oAuth2Client = getAuthClient();

//     oAuth2Client.getToken(code, (err, tokens) => {
//       if (err) {
//         console.log("Authentication error");
//         console.log(err);
//       } else {
//         console.log("Authentication successful");
//         console.log(tokens);
//         oAuth2Client.setCredentials(tokens);

//         setLoginStatus(true);

//         res.redirect("/api/authentication");
//       }
//     });
//   }
// });

/* app.post("/upload", (req, res) => {
  upload(req, res, function (err) {
    if (err) throw err;
    console.log("filess: ", req.files)
    // console.log("name: ", req.file.filename);

    let oAuth2Client = getAuthClient()

    const drive = google.drive({
      version: "v3",
      auth: oAuth2Client,
    });

    var folderId = "1FC5OAoz8bud4TGCjjaEyIzwJvJE4nSHY";

    const files = req.files

    files.map((filedata, index) => {
      const filemetadata = {
        name: filedata.filename,
        parents: [folderId],
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
          if (err) throw err;
  
          console.log("after: ", file);
  
          // delete the file images folder
          fs.unlinkSync(filedata.path);
        }
      );
    })
    res.render("success", { name: name, pic: pic, success: true });
  });
});
*/

// app.get("/logout", (req, res) => {
//   setLoginStatus(false);

//   let oAuth2Client = getAuthClient();
//   oAuth2Client.setCredentials({});
//   res.redirect("/");
// });

// app.get("/test", (req, res) => {
//   res.render("admin");
// });
