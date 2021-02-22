const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { google, Auth } = require("googleapis");

const { getAuthClient, getUserProfile, getAuthUrl } = require("../utils/auth");

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

  var filepath = path.join(__dirname, "../download_temp") + "/" + "test.png";
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

  output.on('end', function() {
    console.log('Data has been drained');
  });

  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  archive.pipe(output);

  archive.directory('./download_temp', false);

  archive.finalize()
  // *********************************

});

module.exports = router;
