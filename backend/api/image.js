require("dotenv").config();

const express = require("express");
const router = express.Router();

// Import database service
const { getImageById } = require("../utils/dbService/index");

/**
 * @method GET
 * @api /api/image/:imageId
 * @description This API is to get the image by event id and render to display
 * @params 
 *        - imageId (query param) 
 * @return
 *        - bufferData with content type (image/jpeg)
 */
router.get("/:imageId", async (req, res) => {
  const { imageId } = req.params;

  // JUST FOR TEST
  // In the future will get image data in Event table
  let query = getImageById(imageId);
  let queryResult = [];

  await query
    .then((result) => {
      console.log("result: ", result);
      queryResult = result[0];
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        messages: "Bad request",
      });
    });

  // Convert base64 to Buffer, set response contentType and send to client
  const bufferData = new Buffer.from(queryResult.image, "base64");
  res.contentType("image/jpeg");
  res.send(bufferData);
});

module.exports = router;
