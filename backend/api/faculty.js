require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
const async = require("async");
const { google } = require("googleapis");

// Import database service
const {
  getEventsByFacultyName,
  getAllFaculty,
  getPostedArticlesOfEvent,
} = require("../utils/dbService/index");

// Import middleware
const {
  managerValidation,
  gwAccountValidation,
} = require("../api/middleware/verification");

// Constants
const _MANAGER_ROLE_ID = 3;

/* Get all Faculty information permission: 
    - Manager 
*/
router.get("/", managerValidation, async (req, res) => {
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

/* Get events of a Faculty permission: 
    - Manager 
    - Coordinators with exact faculty
    - Students with exact faculty
*/
router.get("/:facultyName", gwAccountValidation, async (req, res) => {
  const facultyName = req.params.facultyName;
  const data = res.locals.data;

  if (
    data.userInfo.FK_role_id != _MANAGER_ROLE_ID &&
    data.userInfo.faculty_name.toLowerCase() != facultyName.toLowerCase()
  ) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      // path: "/",
      messenger: "Faculty access permission required",
    });
  }

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

/* Get event information of a faculty permission: 
    - Manager 
    - Coordinators
    - Students
*/

// Future development ============================================== ?????????????


/* Get event info and posted articles of an event permission:    (Not yet set permission)
    - Manager 
    - Coordinators
    - Students
    - Guest ???
*/
router.get("/:facultyName/:eventId/postedArticles", async (req, res) => {
  const facultyName = req.params.facultyName;
  const eventId = req.params.eventId;

  const query = getPostedArticlesOfEvent(eventId, facultyName);
  let queryResult = [];

  await query
    .then((result) => {
      console.log("result: ", result);

      res.status(200).json({
        //  eventCode: "",          ????????????????????
        event: result[result.length - 2][0],   // Because event is only 1, so dont need to pass array to FE
        articles: result[result.length - 1],
      });
    })
    .catch((err) => {
      if (err) {
        console.log("Err: ", err);
        return res.status(501).json({
          messages: "Bad request",
        });
      } else {
        return res.status(404).json({
          messages: "Event not found",
        });
      }
    });
});


router.post("/:facultyName/:eventId/download", (req, res) => {
  const facultyName = req.params.facultyName;
  const eventId = req.params.eventId;

  res.json({
    test: "hihi",
  });
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
