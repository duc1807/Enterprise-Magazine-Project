const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const path = require("path");
var cors = require("cors");
const async = require("async");
const multer = require("multer");
const { google, Auth } = require("googleapis");

const OAuth2Data = require("./credentials.json");
const { getAuthUrl, getAuthClient } = require("./utils/auth");

const app = express();

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

const SCOPES =
  "https://www.googleapis.com/auth/drive.file " +
  "https://www.googleapis.com/auth/userinfo.profile";

app.set("view engine", "ejs");

app.use(cors());

// Parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
).use(cookieParser());

// parse application/json
app.use(bodyParser.json());

// app.use(express.static(path.join(__dirname, '../frontend/src')))

// api controllers
app
  .use("/", require("./api/authentication"))
  // Authentication API
  .use("/api/admin", require("./api/Authentication/admin"))
  .use("/api/student", require("./api/Authentication/student"))

  // Faculty api
  .use("/api/faculty", require("./api/faculty"))


  
  .use("/api/user", require("./api/user"))


  .use("/api/folder", require("./api/folder"))
  .use("/api/upload", require("./api/upload"))
  .use("/api/download", require("./api/download"))
  .use("/api/notification", require("./api/mailnotification"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/src/index.html"));
});

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

app.listen(5000, () => {
  console.log("App started on port 5000");
});
