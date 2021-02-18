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

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URI = OAuth2Data.web.redirect_uris[0];

var name, pic;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

let AUTHED = undefined;

const loginStatus = () => {
  return AUTHED;
};

const setLoginStatus = (authed) => {
  AUTHED = authed;
};

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./images");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: Storage,
}).single("file"); //Field name and max count

const SCOPES =
  "https://www.googleapis.com/auth/drive.file " +
  "https://www.googleapis.com/auth/userinfo.profile";

app.set("view engine", "ejs");

app.use(cors());

// parse application/x-www-form-urlencoded
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

app.get("/", (req, res) => {
  if (!loginStatus()) {
    var url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log(url);

    res.render("index", { url: url, clientID: CLIENT_ID });
  } else {
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

app.post("/upload", (req, res) => {
  upload(req, res, function (err) {
    if (err) throw err;
    console.log("file: ", req.file.path);
    console.log("name: ", req.file.filename);

    const drive = google.drive({
      version: "v3",
      auth: oAuth2Client,
    });

    var folderId = "1FC5OAoz8bud4TGCjjaEyIzwJvJE4nSHY";

    const filemetadata = {
      name: req.file.filename,
      parents: [folderId],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
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

        fs.unlinkSync(req.file.path);
        res.render("success", { name: name, pic: pic, success: true });
      }
    );
  });
});

app.post("/createfolder", (req, res) => {
  const { folderName } = req.body;

  const drive = google.drive({
    version: "v3",
    auth: oAuth2Client,
  });

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

  var fileMetadata = {
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

        async.eachSeries(permissions, (permission, callback) => {
          drive.permissions.create(
            {
              fileId: file.data.id,
              requestBody: permission,
              fields: "id",
              sendNotificationEmail: false
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
        }, (err) => {
          if (err) {
            // Handle error
            console.error(err);
          } else {
            // All permissions inserted
            console.log("All permissions inserted");
          }
        });
      }
    }
  );

  console.log("name: ", folderName);
});

app.get("/logout", (req, res) => {
  setLoginStatus(false);
  oAuth2Client.setCredentials(undefined);
  res.redirect("/");
});

app.listen(5000, () => {
  console.log("App started on port 5000");
});
