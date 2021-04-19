require("dotenv").config();

const express = require("express");
const router = express.Router();

// Import database service
const {
  getEventsByFacultyId,
  getAllFaculty,
  getPostedArticlesOfEvent,
  getEventById,
  getSubmittedArticles,
  getSelectedArticles,
  getRejectedArticles,
} = require("../utils/dbService/index");

// Import middleware
const {
  managerValidation,
  gwAccountValidation,
  coordinatorValidation,
} = require("../api/middleware/verification");

// Constants
const _MANAGER_ROLE_ID = 3;

/**
 * @method GET
 * @api /api/faculties/
 * @permissions Manager
 * @description API for getting all Faculties information
 * @params null
 * @return
 *      - faculties: Array[]
 * @notes
 */
router.get("/", managerValidation, async (req, res) => {
  // Get all faculties
  const query = getAllFaculty();
  let queryResult = undefined;

  await query
    .then((result) => {
      queryResult = result;
      res.status(200).json({
        status: res.statusCode,
        success: true,
        faculties: queryResult,
      });
    })
    .catch((err) => {
      return res.status(501).json({
        status: res.statusCode,
        success: false,
        messages: "Bad request",
      });
    });
});

/**
 * @method GET
 * @api /api/faculties/:facultyId
 * @permissions
 *      - Manager
 *      - Coordinators (exact faculty)
 *      - Students (exact faculty)
 * @description API for getting all events of a faculty
 * @params
 *      - facultyId: Int (req.params)
 * @return
 *      - events: Array[]
 *          + .................................. ???
 * @notes
 */
router.get("/:facultyId", gwAccountValidation, async (req, res) => {
  const facultyId = req.params.facultyId;
  const data = res.locals.data;

  // If the user role is student || coordinator, check if their faculty is valid or not
  if (
    data.userInfo.FK_role_id != _MANAGER_ROLE_ID &&
    data.userInfo.FK_faculty_id != facultyId
  ) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      messenger: "Faculty access permission required",
    });
  }

  // Get all events by faculty name from params
  const query = getEventsByFacultyId(facultyId);
  let queryResult = [];

  await query
    .then((result) => {
      queryResult = result;

      // Response event's infomations if success
      res.status(200).json({
        status: res.statusCode,
        success: true,
        events: queryResult,
      });
    })
    .catch((err) => {
      if (!!err) {
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          messages: "Bad request",
        });
      } else {
        // If err = false, return faculty not found
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          messages: "Faculty not found",
        });
      }
    });
});

module.exports = router;
