require("dotenv").config();

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { google, Auth } = require("googleapis");

const { getAuthClient, getUserProfile, getAuthUrl } = require("../utils/auth");
const key = require("../private_key.json");

// const SCOPES =
//   "https://www.googleapis.com/auth/drive.file " +
//   "https://www.googleapis.com/auth/userinfo.profile " +
//   "https://www.googleapis.com/auth/drive.metadata ";

router.get("/", (req, res) => {
  const { fileID } = req.body;

  // 1yEnOfJzvD9nrlSQVbJEHLwIHqm9QzgKu

  // let oAuth2Client = getAuthClient();

  // const drive = google.drive({
  //   version: "v2",
  //   auth: oAuth2Client,
  // });

  // var dest = fs.createWriteStream("./download_temp/test.png");
  // var fileId = "1srUPEQ8YNP4R7ln06I7w1VMmfA9abqiq";

  // drive.files
  //   .get({
  //     fileId: fileId,
  //     alt: "media",
  //   }, {responseType: 'stream'}, (err, res) => {
  //     console.log("data: ", res)
  //     res.data
  //  .on('end', () => {
  //     console.log('Done');
  //  })
  //  .on('error', err => {
  //     console.log('Error', err);
  //  })
  //  .pipe(dest);
  //   })

  let filepath = path.join(__dirname, "../download_temp") + "/" + "test.png";
  console.log(filepath);
  res.sendFile(filepath);

  // fs.unlinkSync(filepath)

  // ========>>>>>>  Using ID to make unique files

  // *************************************************** ZIP files
  const output = fs.createWriteStream("../backend/ZIP" + `/${Date.now()}.zip`);

  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  output.on("close", function () {
    console.log(archive.pointer() + " total bytes");
    console.log(
      "archiver has been finalized and the output file descriptor has closed."
    );
  });

  output.on("end", function () {
    console.log("Data has been drained");
  });

  archive.on("warning", function (err) {
    if (err.code === "ENOENT") {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  archive.pipe(output);

  archive.directory("./download_temp", false);

  archive.finalize();
  // *********************************
});

/** 
 * @method POST
 * @description API for deleting event
 * @params 
 *      - eventId: Int
 * @return 
 *      - ZIP files for download
 * @notes 
 *      - Redirect user to drive folder???
 */
router.post("/testdownloadselectedarticles", (req, res) => {
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

  const drive = google.drive({
    version: "v3",
    auth: jwToken,
  });

  // var dest = fs.createWriteStream("./download_temp");
  const fileId = "1LE66TBX2vqqdijNAnty1N6IR43LybXRP";

  drive.files.list(
    {
      corpora: "user",
      // q: "mimeType='application/vnd.google-apps.folder'",
      includeRemoved: false,
      auth: jwToken,
      spaces: "drive",
      fileId: fileId,
      supportsAllDrives: true,
      fields: "nextPageToken, files(id, name, mimeType)",
      q: `'${fileId}' in parents`,
    },
    function (err, response) {
      // TODO handle response
      console.log("drive folder: ", response.data.files);

      const files = response.data.files;

      // *************************************************** ZIP files
      const output = fs.createWriteStream(
        "../backend/ZIP" + `/${Date.now()}.zip`
      );

      const archive = archiver("zip", {
        zlib: { level: 9 }, // Sets the compression level.
      });

      output.on("close", function () {
        console.log(archive.pointer() + " total bytes");
        console.log(
          "Archiver has been finalized."
        );
      });

      output.on("end", function () {
        console.log("Data has been drained");
      });

      archive.on("warning", function (err) {
        if (err.code === "ENOENT") {
          // log warning
        } else {
          // throw error
          throw err;
        }
      });

      archive.pipe(output);

      files.map((item) => console.log(item.name));
    }
  );

  // drive.files
  //   .get({
  //     fileId: fileId,
  //     alt: "media",
  //   }, {responseType: 'stream'}, (err, res) => {
  //     console.log("data: ", res)
  //     res.data
  //  .on('end', () => {
  //     console.log('Done');
  //  })
  //  .on('error', err => {
  //     console.log('Error', err);
  //  })
  //  .pipe(dest);
  //   })
});

module.exports = router;
