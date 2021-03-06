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

/**
 * @method GET
 * @permissions Manager
 * @description API for getting all Faculties information
 * @params null
 * @return
 *      - faculties: Array[]
 *          +
 * @notes
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

/**
 * @method GET
 * @permissions
 *      - Manager
 *      - Coordinators (exact faculty)
 *      - Students (exact faculty)
 * @description API for getting all events information of a faculty
 * @params
 *      - facultyName: String (req.params)
 * @return
 *      - events: Array[]
 *          + .................................. ???
 * @notes
 */
router.get("/:facultyName", gwAccountValidation, async (req, res) => {
  const facultyName = req.params.facultyName;
  const data = res.locals.data;

  // If the user role is student || coordinator, check if their faculty is valid or not
  if (
    data.userInfo.FK_role_id != _MANAGER_ROLE_ID &&
    data.userInfo.faculty_name.toLowerCase() != facultyName.toLowerCase()
  ) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      messenger: "Faculty access permission required",
    });
  }

  // Get all events by faculty name from params
  const query = getEventsByFacultyName(facultyName);
  let queryResult = [];

  await query
    .then((result) => {
      console.log("result: ", result);
      queryResult = result;

      // Response event's infomations
      res.header("Content-Type", "application/json");
      res.status(200).json({
        events: queryResult,
      });
    })
    .catch((err) => {
      if(!!err) {
        console.log("Err: ", err);
        return res.status(501).json({
          messages: "Bad request",
        });
      } else {
        // If err = false, return faculty not found
        return res.status(404).json({
          messages: "Faculty not found",
        });
      }
    });

  // Prettier json response?
  // res.status(200).json(JSON.stringify({
  //     events: queryResult,
  //   }, null, 4));
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

/**
 * @method GET
 * @permissions
 *      - Manager
 *      - Coordinators (exact faculty)
 *      - Students (exact faculty)
 *      - Guest ???
 * @description API for getting event information and its posted articles (news)
 * @params
 *      - facultyName: String (req.params)
 *      - eventId: Int (req.params)
 * @return
 *      - events: Array[]
 *          + .................................. ???
 *      - articles: Array[]
 *          + ........................... ???
 * @notes
 */
router.get("/:facultyName/:eventId/postedArticles", async (req, res) => {
  const facultyName = req.params.facultyName;
  const eventId = req.params.eventId;

  // Get event info and its posted articles by eventId and facultyName
  const query = getPostedArticlesOfEvent(eventId, facultyName);
  let queryResult = [];

  await query
    .then((result) => {
      console.log("result: ", result);

      res.status(200).json({
        //  eventCode: "",          ????????????????????
        // Because event is only 1, so dont need to pass array to FrontEnd
        event: result[result.length - 2][0], 
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
        // Ì er = false => Event not found
        return res.status(404).json({
          messages: "Event not found",
        });
      }
    });
});

// =================================================== TEST CODE

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
