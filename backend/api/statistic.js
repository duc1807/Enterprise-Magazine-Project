require("dotenv").config();

const express = require("express");
const {
  getOverallStats,
  getContributionByFaculty,
  getContributionByStatus,
} = require("../utils/dbService");
const { managerValidation } = require("./middleware/verification");
const router = express.Router();

// API
//
router.get("/overall", managerValidation, async (req, res) => {
  // const query = getTotalEvent();
  // await query
  //   .then((result) => {
  //     console.log("result: ", result);
  //     return res.status(200).json({
  //       status: res.statusCode,
  //       success: true,
  //       event: result,
  //     });
  //   })
  //   .catch((err) => {
  //     if (err) {
  //       console.log("Err: ", err);
  //       return res.status(501).json({
  //         status: res.statusCode,
  //         success: false,
  //         messages: "Bad request",
  //       });
  //     } else {
  //       // If er == false => Event not found
  //       return res.status(404).json({
  //         status: res.statusCode,
  //         success: false,
  //         messages: "Invalid request!",
  //       });
  //     }
  //   });
  // console.log("query[0]: ", query);

  const query1 = getOverallStats();
  await query1
    .then((results) => {
      console.log("results: ", results);

      return res.status(200).json({
        status: res.statusCode,
        success: true,
        data: results,
      });
    })
    .catch((err) => {
      if (err) {
        console.log("Err: ", err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          messages: "Bad request",
        });
      } else {
        // If er == false => Contribution not found
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          messages: "Invalid request!",
        });
      }
    });
});

router.get("/:facultyId", managerValidation, async (req, res) => {
  const { facultyId } = req.params;
  const query = getContributionByFaculty(facultyId);
  await query
    .then(async (results) => {
      console.log("results all contribution (static.js): ", results[1][0]);
      const queryResult = {
        totalContributions: results[0][0].totalContributions,
        totalPendingContributions: results[1][0].totalPendingContributions,
        totalSelectedContributions: results[2][0].totalSelectedContributions,
        totalRejectedContributions: results[3][0].totalRejectedContributions,
      };
      return res.status(200).json({
        status: res.statusCode,
        success: true,
        contribution: queryResult,
      });
    })
    .catch((err) => {
      if (err) {
        console.log("Err: ", err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          messages: "Bad request",
        });
      } else {
        // If er == false => Contribution not found
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          messages: "Invalid request!",
        });
      }
    });
});

module.exports = router;
