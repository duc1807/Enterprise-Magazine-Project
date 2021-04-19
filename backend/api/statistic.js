require("dotenv").config();

const { forEach, all } = require("async");
const express = require("express");
const router = express.Router();

const ARTICLE_STATUS = [
  "pendingContributions",
  "selectedContributions",
  "rejectedContributions",
];
// Import database services
const {
  getOverallStats,
  getContributionByFaculty,
  getAverageSelectedStats,
  getAverageCommentStats,
  getContributionEachMonthByYear,
} = require("../utils/dbService");

// Import middleware validation
const { managerValidation } = require("./middleware/verification");

/**
 * @method GET
 * @api /api/statistics/overall/:year
 * @permissions
 *      - Manager
 * @description API for getting overall stats
 * @params
 *      - year: Int
 * @return
 *      - stats: Objects
 *          + .................................. ???
 * @notes
 */
router.get("/overall/:year", managerValidation, async (req, res) => {
  const { year } = req.params;

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
                  data[`contributionStatsOf${year}`] = contributionStats;
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
 * @api /api/statistics/:facultyId
 * @permissions
 *      - Manager

 * @description API for getting all contribution stats on each events of a faculty
 * @params
 *      - facultyId: Int (req.params)
 * @return
 *      - events: Array[]
 *          + .................................. ???
 * @notes
 *      - create Object queryResult is high complexity, using loop ???
 */
router.get("/:facultyId", managerValidation, async (req, res) => {
  const { facultyId } = req.params;
  // Get Contribution stats and Comment stats, comment info by each faculty
  const query = getContributionByFaculty(facultyId);
  await query
    .then(async (results) => {
      // console.log("results uncomment list: ", results[5]);
      let uncommentArr = [];
      // loop for the query result to get all uncomment info by each articles at position[6]  ???? Or result.length - 1 ?????
      results[5].map((uncomment) => {
        // append each UncommentInfo object to the uncommentArr
        uncommentArr.push(uncomment);
      });

      // Create an array for storing total pending article following event title

      let pendingArr = [];
      const extension = "...";
      results[0].map((pendingResult) => {
        console.log("pendingResult: ", pendingResult);
        let pendingObj = {
          pendingContributions: pendingResult.pendingContributions,
          eventId: pendingResult.eventId,
        };
        if (pendingResult.eventTitle.length >= 10) {
          pendingObj.eventTitle =
            pendingResult.eventTitle.substr(0, 11) + extension;
        } else {
          pendingObj.eventTitle = pendingResult.eventTitle;
        }

        pendingArr.push(pendingObj);
      });

      // Create an array for storing total selected article following event title
      let selectedArr = [];
      results[1].map((selectedResult) => {
        let selectedObj = {
          selectedContributions: selectedResult.selectedContributions,
          eventId: selectedResult.eventId,
        };
        if (selectedResult.eventTitle.length >= 10) {
          selectedObj.eventTitle =
            selectedResult.eventTitle.substr(0, 11) + extension;
        } else {
          selectedObj.eventTitle = selectedResult.eventTitle;
        }
        selectedArr.push(selectedObj);
      });
      // Create an array for storing total rejected article following event title
      let rejectedArr = [];
      results[2].map((rejectedResult) => {
        // console.log("rejectedResult: ", rejectedResult);
        let rejectedObj = {
          rejectedContributions: rejectedResult.rejectedContributions,
          eventId: rejectedResult.eventId,
        };
        if (rejectedResult.eventTitle.length >= 10) {
          rejectedObj.eventTitle =
            rejectedResult.eventTitle.substr(0, 11) + extension;
        } else {
          rejectedObj.eventTitle = rejectedResult.eventTitle;
        }
        rejectedArr.push(rejectedObj);
      });

      let statsResult = [];
      let passedEventId = [];
      let eventPosDetail = {};
      let newArr = pendingArr.concat(selectedArr, rejectedArr);
      console.log("newArr: ", newArr);
      newArr.map((object) => {
        console.log("object: ", object);
        let key = `position${object.eventId}`;
        if (passedEventId.includes(object.eventId)) {
          let eventPosition = eventPosDetail[key];
          console.log("position: ", eventPosition);

          if (
            (object && object.pendingContributions) ||
            object.selectedContributions ||
            object.rejectedContributions
          ) {
            let contribution =
              (object.pendingContributions && {
                pendingContributions: object.pendingContributions,
              }) ||
              (object.selectedContributions && {
                selectedContributions: object.selectedContributions,
              }) ||
              (object.rejectedContributions && {
                rejectedContributions: object.rejectedContributions,
              });
            statsResult[eventPosition].contributions[
              Object.keys(contribution)[0]
            ] = Object.values(contribution)[0];
          }
        } else {
          passedEventId.push(object.eventId);
          let eventInfo = {
            // eventId: object.eventId,
            eventName: object.eventTitle,
            contributions: {},
          };

          if (
            (object && object.pendingContributions) ||
            object.selectedContributions ||
            object.rejectedContributions
          ) {
            let contribution =
              (object.pendingContributions && {
                pendingContributions: object.pendingContributions,
              }) ||
              (object.selectedContributions && {
                selectedContributions: object.selectedContributions,
              }) ||
              (object.rejectedContributions && {
                rejectedContributions: object.rejectedContributions,
              });

            ARTICLE_STATUS.forEach((status) => {
              eventInfo.contributions[status] = 0;
            });

            eventInfo.contributions[
              Object.keys(contribution)[0]
            ] = Object.values(contribution)[0];
          }

          statsResult.push(eventInfo);
          eventPosDetail[key] = statsResult.length - 1;
        }
      });

      return res.status(200).json({
        status: res.statusCode,
        success: true,
        data: statsResult,
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
