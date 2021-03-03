require("dotenv").config();

const express = require("express");
const router = express.Router();

// Import modules
const { getImageById } = require('../utils/dbService/index')

/* Get the image by event id and render */
router.get("/:imageId", async (req, res) => {
    const { imageId } = req.params

    // JUST FOR TEST
    // In the future will get image data in Event table
    let query = getImageById(imageId)
    let queryResult = []

    await query
    .then((result) => {
      console.log("result: ", result);
      query = getImageById()
      queryResult = result[0];
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        messages: "Bad request",
      });
    });
    
    // Convert base64 to Buffer and send 
    const bufferData = new Buffer.from(queryResult.image, "base64")
    res.contentType("image/jpeg");
    res.send(bufferData);
});

module.exports = router