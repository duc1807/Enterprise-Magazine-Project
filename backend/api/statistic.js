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
  const data = res.locals.data;
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
      console.log("results all contribution (static.js): ", results);
      // await getContributionByStatus(facultyId)
      //   .then((threeTotal) => {
      //     console.log("other: ", threeTotal);
      //     return res.status(200).json({
      //       status: res.statusCode,
      //       success: true,
      //       all_contribution: results,
      //       detai_contribution: threeTotal,
      //     });
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     return res.status(501).json({
      //       status: res.statusCode,
      //       success: false,
      //       messages: "Bad request",
      //     });
      //   });
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

module.exports = router;
