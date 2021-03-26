require("dotenv").config();

const express = require("express");
const {
  getOverallStats,
  getContributionByFaculty,
  getAverageSelectedStats,
  getAverageCommentStats,
  getContributionEachMonthByYear,
} = require("../utils/dbService");
const { managerValidation } = require("./middleware/verification");
const router = express.Router();

// API STATISTICS

/**
 * @method GET
 * @api /api/statistic/overall
 * @permissions
 *      - Manager
 * @description API for getting overall stats
 * @params
 * @return
 *      - stats: Objects
 *          + .................................. ???
 * @notes
 */
router.get("/overall", managerValidation, async (req, res) => {
  const { year } = req.body;

  // Get overall stats include total Received and Publish (Posted) Article
  const query = getOverallStats();
  await query
    .then(async (result) => {
      // create data object to store overall stats
      let data = {
        totalReceived: result[0][0].TotalReceived,
        totalPublish: result[1][0].TotalPublish,
      };
      //Get average selected article on total contribution
      const query1 = getAverageSelectedStats();
      await query1
        .then(async (result1) => {
          // Create object to store stats of total selected articles and total contribution
          let AVGAcceptedArticle = {
            TotalAcceptedArticles: result1[0][0].TotalAcceptedArticles,
            TotalReceivedArticles: result1[1][0].TotalReceivedArticles,
          };
          // Store object to Data object
          data.AVGAcceptedArticle = AVGAcceptedArticle;
          // console.log("data: ", data);
          // Get average articles are commented on time (14 days)
          const query2 = getAverageCommentStats();
          await query2
            .then(async (result2) => {
              // Create object to store stats of all article and article has comment on time (14 days)
              let AVGArticleComment = {
                AllArticle: result2[0][0].AllArticle,
                CommentedArticle: result2[1][0].CommentedArticle,
              };
              // Store object to Data object
              data.AVGCommentOnTime = AVGArticleComment;
              // console.log("data: ", data);
              // Get contribution following each months of specific year
              const query3 = getContributionEachMonthByYear(year);
              await query3
                .then(async (result3) => {
                  // Create object store contribution stats on each months
                  let contributionStats = {
                    contributionsInJanuary: result3[0][0].PostedArticleInMonth1,
                    contributionsInFebruary:
                      result3[1][0].PostedArticleInMonth2,
                    contributionsInMarch: result3[2][0].PostedArticleInMonth3,
                    contributionsInApril: result3[3][0].PostedArticleInMonth4,
                    contributionsInMay: result3[4][0].PostedArticleInMonth5,
                    contributionsInJune: result3[5][0].PostedArticleInMonth6,
                    contributionsInJuly: result3[6][0].PostedArticleInMonth7,
                    contributionsInAugust: result3[7][0].PostedArticleInMonth8,
                    contributionsInSeptember:
                      result3[8][0].PostedArticleInMonth9,
                    contributionsInOctober:
                      result3[9][0].PostedArticleInMonth10,
                    contributionsInNovember:
                      result3[10][0].PostedArticleInMonth11,
                    contributionsInDecember:
                      result3[11][0].PostedArticleInMonth12,
                  };
                  // Store object to Data object
                  data.contributionStatsByYear = contributionStats;
                  return res.status(200).json({
                    status: res.statusCode,
                    success: true,
                    stats: data,
                  });
                })
                .catch((err) => {
                  if (err) console.log("Err: ", err);
                  return res.status(501).json({
                    status: res.statusCode,
                    success: false,
                    messages: "Bad request",
                  });
                });
            })
            .catch((err) => {
              if (err) console.log("Err: ", err);
              return res.status(501).json({
                status: res.statusCode,
                success: false,
                messages: "Bad request",
              });
            });
        })
        .catch((err) => {
          if (err) console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            messages: "Bad request",
          });
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
        // If er == false => Contribution stats not found
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          messages: "Invalid request!",
        });
      }
    });
});

/**
 * @method GET
 * @api /api/statistic/:facultyId
 * @permissions
 *      - Manager

 * @description API for getting all contribution stats on each events of a faculty
 * @params
 *      - facultyId: Int (req.params)
 * @return
 *      - events: Array[]
 *          + .................................. ???
 * @notes
 */
router.get("/:facultyId", managerValidation, async (req, res) => {
  const { facultyId } = req.params;
  // Get Contribution stats and Comment stats, comment info by each faculty
  const query = getContributionByFaculty(facultyId);
  await query
    .then(async (results) => {
      console.log("results uncomment list: ", results[6]);
      let uncommentArr = [];
      // loop for the query result to get all uncomment info by each articles
      results[6].map((uncomment) => {
        console.log("uncomment: ", uncomment);
        // append each UncommentInfo object to the uncommentArr
        uncommentArr.push(uncomment);
      });

      // Create object to store all stats of each faculty
      const queryResult = {
        totalContributions: results[0][0].totalContributions,
        totalPendingContributions: results[1][0].totalPendingContributions,
        totalSelectedContributions: results[2][0].totalSelectedContributions,
        totalRejectedContributions: results[3][0].totalRejectedContributions,
        totalCommentedOnTimeContributions:
          results[4][0].totalCommentedOnTimeContributions,
        totalUncommentedOnTimeContributions:
          results[5][0].totalUncommentedOnTimeContributions,
        uncommentList: uncommentArr,
      };
      return res.status(200).json({
        status: res.statusCode,
        success: true,
        data: queryResult,
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
