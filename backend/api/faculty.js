require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
const async = require("async");
const { google } = require("googleapis");

const {
  getEventsByFacultyName,
  getAllFaculty,
  getSelectedArticlesOfEvent,
} = require("../utils/dbService/index");

router.get("/", async (req, res) => {
  const query = getAllFaculty();
  let queryResult = undefined;

  await query
    .then((result) => {
      console.log("result: ", result);
      queryResult = result;
      res.status(200).json({
        faculties: queryResult,
      });
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        messages: "Bad request",
      });
    });
});

// Test get faculty info
router.get("/:facultyName", async (req, res) => {
  const facultyName = req.params.facultyName;

  const query = getEventsByFacultyName(facultyName);
  let queryResult = [];

  await query
    .then((result) => {
      console.log("result: ", result);
      queryResult = result;
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        messages: "Bad request",
      });
    });

  if (queryResult.length) {
    res.header("Content-Type", "application/json");
    res.status(200).json({
      events: queryResult,
    });

    // Prettier json response?
    // res.status(200).json(JSON.stringify({
    //     events: queryResult,
    //   }, null, 4));
  } else {
    res.status(404).json({
      status: res.statusCode,
      message: "Not found",
    });
  }
});

router.get("/:facultyName/:eventId", async (req, res) => {
  const facultyName = req.params.facultyName;
  const eventId = req.params.eventId;

  const query = getSelectedArticlesOfEvent(eventId);
  let queryResult = [];

  await query
    .then((result) => {
      console.log("result: ", result);
      queryResult = result;
      res.status(200).json({
        events: queryResult,
      });
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        messages: "Bad request",
      });
    });
});

router.post("/:facultyName/:eventId/download", (req, res) => {
  const facultyName = req.params.facultyName;
  const eventId = req.params.eventId;

  res.json({
      test: "hihi"
  })
});

router.post("/", async (req, res) => {
  const { facultyId } = req.body;

  const query = getFacultyById("1");
  let queryResult = [];

  await query
    .then((result) => {
      console.log("result: ", result);
      queryResult = result;
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        messages: "Bad request",
      });
    });
});

module.exports = router;
