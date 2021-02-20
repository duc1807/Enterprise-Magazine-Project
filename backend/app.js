const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
var cors = require("cors");
const async = require("async")

const app = express();

const multer = require("multer");

const { google, Auth } = require("googleapis");

const OAuth2Data = require("./credentials.json");

const { getAuthUrl, getAuthClient } = require('./utils/auth')

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URI = OAuth2Data.web.redirect_uris[0];

var name, pic;

let AUTHED = undefined;

const loginStatus = () => {
  return AUTHED;
};

const setLoginStatus = (authed) => {
  AUTHED = authed;
};

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
);

// parse application/json
app.use(bodyParser.json());

// api routes
app.use("/api/user", require("./api/user"));
app.use("/api/folder", require("./api/folder"));
app.use("/api/upload", require("./api/upload"));

app.get("/", (req, res) => {
  let status = loginStatus()
  if (!status) {

    var url = getAuthUrl()
    console.log(url);

    res.render("index", { url: url, clientID: CLIENT_ID });
  } else {

    let oAuth2Client = getAuthClient()
    
    var oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: "v2",
    });

    // user info

    oauth2.userinfo.get((err, response) => {
      if (err) throw err;

      console.log(response.data);

      name = response.data.name;
      pic = response.data.picture;

      res.render("success", { name: name, pic: pic, success: false });
    });
  }
});

app.get("/google/callback", (req, res) => {
  const code = req.query.code;

  if (code) {
    console.log("codee: ", code);
    // get access token
    let oAuth2Client = getAuthClient()

    oAuth2Client.getToken(code, (err, tokens) => {
      if (err) {
        console.log("Authentication error");
        console.log(err);
      } else {
        console.log("Authentication successful");
        console.log(tokens);
        oAuth2Client.setCredentials(tokens);

        setLoginStatus(true);

        res.redirect("/");
      }
    });
  }
});

// app.post("/upload", (req, res) => {
//   upload(req, res, function (err) {
//     if (err) throw err;
//     console.log("filess: ", req.files)
//     // console.log("name: ", req.file.filename);

//     let oAuth2Client = getAuthClient()

//     const drive = google.drive({
//       version: "v3",
//       auth: oAuth2Client,
//     });

//     var folderId = "1FC5OAoz8bud4TGCjjaEyIzwJvJE4nSHY";

//     const files = req.files

//     files.map((filedata, index) => {
//       const filemetadata = {
//         name: filedata.filename,
//         parents: [folderId],
//       };
  
//       const media = {
//         mimeType: filedata.mimetype,
//         body: fs.createReadStream(filedata.path),
//       };
  
//       drive.files.create(
//         {
//           resource: filemetadata,
//           media: media,
//           fields: "id",
//         },
//         (err, file) => {
//           if (err) throw err;
  
//           console.log("after: ", file);
  
//           // delete the file images folder
//           fs.unlinkSync(filedata.path);
//         }
//       );
//     })
//     res.render("success", { name: name, pic: pic, success: true });
//   });
// });


app.get("/logout", (req, res) => {
  setLoginStatus(false);

  let oAuth2Client = getAuthClient()
  oAuth2Client.setCredentials(undefined);
  res.redirect("/");
});

app.listen(5000, () => {
  console.log("App started on port 5000");
});
