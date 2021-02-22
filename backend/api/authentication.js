require("dotenv").config();

const express = require("express");
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
const async = require("async");
const multer = require("multer");
const { google, Auth } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const path = require('path')

// Import modules from other files
const { getAuthClient, getUserProfile, getAuthUrl } = require("../utils/auth");

// ****************** FOR STUDENTS AND MANAGERS ****************** \\
//
//
//
//
// ****************** FOR STUDENTS AND MANAGERS ****************** \\

router.get("/", async (req, res) => {
  const oAuth2Client = getAuthClient();

  console.log(
    "Credentials: ",
    Boolean(Object.keys(oAuth2Client.credentials).length)
  );

  if (
    oAuth2Client.credentials &&
    !Object.keys(oAuth2Client.credentials).length &&
    oAuth2Client.credentials.constructor == Object
  ) {
    var url = getAuthUrl();
    console.log(url);

    res.render("index", { url: url, clientID: oAuth2Client._clientId });
  } else {
    var oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: "v2",
    });
    // const data = oauth2.tokeninfo();
    // const token = data.config.headers.Authorization.split(" ")[1];
    const tokenInfo = oAuth2Client.credentials;

    console.log("TOKENNNNN : ", tokenInfo);
    const token_old =
      "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZkYjQwZTJmOTM1M2M1OGFkZDY0OGI2MzYzNGU1YmJmNjNlNGY1MDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3MDE3Mjg0NDg0MzctcTVjdWx0c2p0ZjNoajQyZGJlaGg2ZHZmZzE1ZTlrM2UuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3MDE3Mjg0NDg0MzctcTVjdWx0c2p0ZjNoajQyZGJlaGg2ZHZmZzE1ZTlrM2UuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTI2MDY3NTk4MzA4NTQxMTkwMjQiLCJhdF9oYXNoIjoiVFBuS2ZLTERoRENXM0ZfUURtTUk5dyIsIm5hbWUiOiJEdWMgRHVjIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tQk12MGRta3FNQVUvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQU1adXVjbmxNbVJlVGx0RmFqcFBqYldnY2l2LTZ3bXI1QS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiRHVjIiwiZmFtaWx5X25hbWUiOiJEdWMiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTYxMzkxODk4NCwiZXhwIjoxNjEzOTIyNTg0fQ.b7SLAkjUBixbbm26jAirJVMKd-PGS_iwKRhSs5Xs0E_xgvcKjLq1iSyVOBWPeS_v-bAOcKqRymJHgr8BrMAYBJQaV9eM_n7-MBoz9Cij3ZTSH3gniQztxUcHPgPfnTmlsC8r6tfRjbeiH1Gh9Xae6cMRqEbAJX2gowKvEb8hJFUR9D3Jof4Qn7EmTcRCPvDX0I3Uwts2NkSL-TngG6j7Dlkj_0cIknevpHDP7WphTEHLLsRB2UvM4Xcy88dYULUIrSfPAgNfNGrIRTGTGZWEfGrcD9zVZ5I_cdS5ZA525wOPWZgegd3VAXzjkwxbqZRa_9MWjWllx1AH8i8E1GeWKA";
    // await oAuth2Client.revokeToken(token_old).then(console.log("ok go token"))

    const client = new OAuth2Client(oAuth2Client._clientId);

    async function verify() {
      const ticket = await client
        .verifyIdToken({
          idToken: token_old,
          audience: oAuth2Client._clientId,
        })
        .then((value) => {
          return value;
        })
        .catch((err) => {
          console.log(err);

          //   res.sendStatus(401).json({
          //     meesages: "expired token",
          //   });
        });

      const payload = ticket.getPayload();
      const userid = payload["sub"];

      console.log("Userid: ", userid);
    }

    verify()
      .then(console.log("token con hieu luc"))
      .catch((err) => console.log("err o ngoai cung"));

    // Get user info
    oauth2.userinfo.get((err, response) => {
      if (err) throw err;

      console.log(response.data);

      let name = response.data.name;
      let pic = response.data.picture;

      res.render("success", { name: name, pic: pic, success: false });
    });
  }
});

router.get("/google/callback", (req, res) => {
  const code = req.query.code;

  if (code) {
    // Get access token
    let oAuth2Client = getAuthClient();

    oAuth2Client.getToken(code, (err, tokens) => {
      if (err) {
        console.log("Authentication error");
        console.log(err);
      } else {
        console.log("Authentication successful");
        console.log(tokens);
        oAuth2Client.setCredentials(tokens);

        res.redirect("/");
      }
    });
  }
});

router.get("/logout", (req, res) => {
  let oAuth2Client = getAuthClient();
  oAuth2Client.setCredentials({});
  res.redirect("/");
});

// router.get("/download", (req, res) => {
//   // 1yEnOfJzvD9nrlSQVbJEHLwIHqm9QzgKu
  

//   // let oAuth2Client = getAuthClient();

//   // const drive = google.drive({
//   //   version: "v2",
//   //   auth: oAuth2Client,
//   // });

//   // var dest = fs.createWriteStream("./download_temp/test.png");
//   // var fileId = "1srUPEQ8YNP4R7ln06I7w1VMmfA9abqiq";

//   // drive.files
//   //   .get({
//   //     fileId: fileId,
//   //     alt: "media",
//   //   }, {responseType: 'stream'}, (err, res) => {
//   //     console.log("data: ", res)
//   //     res.data
//   //  .on('end', () => {
//   //     console.log('Done');
//   //  })
//   //  .on('error', err => {
//   //     console.log('Error', err);
//   //  })
//   //  .pipe(dest);
//   //   })

//   var filepath = path.join(__dirname, '../download_temp') + '/' + 'test.png' 
//   console.log(filepath)
//   res.sendFile(filepath)
//   fs.unlinkSync(filepath)
// });

// ****************** FOR ADMIN ****************** \\
//
//
//
//
// ****************** FOR ADMIN ****************** \\

module.exports = router;
